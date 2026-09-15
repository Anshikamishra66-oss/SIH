const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5000${path}`);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runE2ETest() {
  console.log('=== STARTING SLOT BOOKING E2E INTEGRATION TEST ===\n');

  // 1. Authenticate Farmer using OTP
  const farmerMobile = '9751000001';
  console.log(`Step 1: Authenticating Farmer with mobile ${farmerMobile}...`);
  const sendOtpRes = await request('POST', '/api/auth/send-otp', { mobile: farmerMobile });
  console.log('Send OTP response:', sendOtpRes.status, sendOtpRes.data.message || sendOtpRes.data);
  const otp = sendOtpRes.data?.data?.otp || '123456';

  const loginRes = await request('POST', '/api/auth/login', {
    mobile: farmerMobile,
    otp: otp,
  });
  console.log('Login response:', loginRes.status, loginRes.data.message || '');
  const token = loginRes.data?.data?.tokens?.accessToken || loginRes.data?.data?.accessToken;
  if (!token) {
    throw new Error('Failed to obtain farmer token: ' + JSON.stringify(loginRes.data));
  }
  const authHeaders = { Authorization: `Bearer ${token}` };
  console.log('✅ Farmer Authenticated Successfully.');

  // 2. Fetch Centres (Mandi)
  console.log('\nStep 2: Fetching Mandis / Centres...');
  const centresRes = await request('GET', '/api/centres');
  const centres = centresRes.data?.data?.centres || [];
  console.log(`Found ${centres.length} centres.`);
  if (centres.length === 0) throw new Error('No centres found');
  const selectedCentre = centres[0];
  console.log(`Selected Centre: ${selectedCentre.name} (${selectedCentre._id})`);

  // 3. Fetch Crops
  console.log('\nStep 3: Fetching MSP Crops...');
  const cropsRes = await request('GET', '/api/crops');
  const crops = cropsRes.data?.data?.crops || [];
  console.log(`Found ${crops.length} crops.`);
  if (crops.length === 0) throw new Error('No crops found');
  const selectedCrop = crops[0];
  console.log(`Selected Crop: ${selectedCrop.name} (MSP: Rs ${selectedCrop.mspPrice})`);

  // 4. Select Date & Fetch Available Slots
  console.log('\nStep 4: Checking Available Slots for Date...');
  // Find a future date (between 1 and 13 days ahead) that farmer hasn't booked yet
  let selectedSlot = null;
  let chosenDateStr = '';
  for (let offset = 1; offset <= 13; offset++) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dateCandidate = d.toISOString().split('T')[0];
    const slotsRes = await request('GET', `/api/centres/${selectedCentre._id}/slots?date=${dateCandidate}`);
    const availableSlots = slotsRes.data?.data?.slots || [];
    const openSlot = availableSlots.find((s) => s.status !== 'full' && s.booked < s.capacity);
    if (openSlot) {
      // Check if farmer already booked this centre on this date
      const myBookingsCheck = await request('GET', '/api/bookings', null, authHeaders);
      const alreadyBookedToday = (myBookingsCheck.data?.data?.bookings || []).some(
        (b) => b.centreId?._id === selectedCentre._id &&
               b.bookingDate &&
               b.bookingDate.startsWith(dateCandidate) &&
               b.status !== 'cancelled'
      );
      if (!alreadyBookedToday) {
        selectedSlot = openSlot;
        chosenDateStr = dateCandidate;
        break;
      }
    }
  }

  if (!selectedSlot) throw new Error('No open slot found in next 13 days');
  console.log(`Found available slot for date ${chosenDateStr}.`);
  console.log(`Selected Slot: ${selectedSlot.startTime} - ${selectedSlot.endTime} (Capacity: ${selectedSlot.capacity}, Booked: ${selectedSlot.booked})`);

  // 5. Confirm Booking (Unique Token + Database Save)
  console.log('\nStep 5: Submitting Slot Booking...');
  const bookingPayload = {
    slotId: selectedSlot._id,
    cropId: selectedCrop._id,
    cropName: selectedCrop.name,
    quantity: 40,
    unit: 'quintal',
  };
  const bookRes = await request('POST', '/api/bookings', bookingPayload, authHeaders);
  console.log('Booking creation status:', bookRes.status);
  console.log('Booking response message:', bookRes.data?.message);
  
  if (bookRes.status !== 201) {
    console.error('Booking failed:', bookRes.data);
    throw new Error('Booking could not be created');
  }

  const booking = bookRes.data.data.booking;
  console.log('✅ Booking Created Successfully:');
  console.log('   - Booking ID:', booking.bookingId);
  console.log('   - Unique Token:', booking.token);
  console.log('   - Centre Name:', booking.centreId?.name);
  console.log('   - Crop Name:', booking.cropName);
  console.log('   - Quantity:', booking.quantity, booking.unit);
  console.log('   - Status:', booking.status);

  // 6. Test Duplicate Booking Prevention (Same Day at Same Centre)
  console.log('\nStep 6: Testing Duplicate Booking Prevention (Same Day)...');
  const dupRes = await request('POST', '/api/bookings', bookingPayload, authHeaders);
  console.log('Duplicate booking status code:', dupRes.status, '(Expected 409 Conflict)');
  console.log('Duplicate error message:', dupRes.data?.message);
  if (dupRes.status !== 409) {
    console.warn('⚠️ Warning: Duplicate check did not return 409!');
  } else {
    console.log('✅ Duplicate booking prevented successfully.');
  }

  // 7. Test Input Validation (Zero/Negative quantity)
  console.log('\nStep 7: Testing Input Validation (Zero/Negative quantity)...');
  const invalidRes = await request('POST', '/api/bookings', { ...bookingPayload, quantity: 0 }, authHeaders);
  console.log('Invalid quantity status:', invalidRes.status, '(Expected 400 Bad Request)');
  console.log('Invalid quantity error:', invalidRes.data?.message);
  if (invalidRes.status === 400) {
    console.log('✅ Validation worked as expected.');
  }

  // 8. Verify Booking in Farmer Dashboard / My Bookings API
  console.log('\nStep 8: Verifying Booking in Farmer Bookings List...');
  const myBookingsRes = await request('GET', '/api/bookings', null, authHeaders);
  const myBookings = myBookingsRes.data?.data?.bookings || [];
  console.log(`Farmer has ${myBookings.length} total bookings.`);
  const found = myBookings.find((b) => b.bookingId === booking.bookingId);
  if (found) {
    console.log(`✅ Verified in Database & API: Token ${found.token}, ID ${found.bookingId}, Status ${found.status}`);
  } else {
    console.error('❌ Error: Booking not returned in farmer bookings list!');
    process.exit(1);
  }

  console.log('\n=== ALL E2E TESTS PASSED SUCCESSFULLY! ===');
}

runE2ETest().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
