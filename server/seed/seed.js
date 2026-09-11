const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const User = require('../models/User.model');
const FarmerProfile = require('../models/FarmerProfile.model');
const OfficerProfile = require('../models/OfficerProfile.model');
const ProcurementCentre = require('../models/ProcurementCentre.model');
const Crop = require('../models/Crop.model');
const Slot = require('../models/Slot.model');
const Booking = require('../models/Booking.model');
const QueueEntry = require('../models/QueueEntry.model');
const Procurement = require('../models/Procurement.model');
const Payment = require('../models/Payment.model');
const Notification = require('../models/Notification.model');
const { generateToken, generateBookingId, startOfDay } = require('../utils/helpers');
const { connectDB, closeDB } = require('../config/db');

async function seed() {
  await connectDB();

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    FarmerProfile.deleteMany({}),
    OfficerProfile.deleteMany({}),
    ProcurementCentre.deleteMany({}),
    Crop.deleteMany({}),
    Slot.deleteMany({}),
    Booking.deleteMany({}),
    QueueEntry.deleteMany({}),
    Procurement.deleteMany({}),
    Payment.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('✅ Data cleared');

  // ---- CROPS ----
  console.log('🌾 Seeding crops...');
  const crops = await Crop.insertMany([
    { name: 'Wheat', nameHindi: 'गेहूं', mspPrice: 2275, unit: 'quintal', season: 'Rabi', category: 'Cereal', isActive: true },
    { name: 'Rice (Paddy)', nameHindi: 'धान', mspPrice: 2183, unit: 'quintal', season: 'Kharif', category: 'Cereal', isActive: true },
    { name: 'Maize', nameHindi: 'मक्का', mspPrice: 2090, unit: 'quintal', season: 'Kharif', category: 'Cereal', isActive: true },
    { name: 'Mustard', nameHindi: 'सरसों', mspPrice: 5650, unit: 'quintal', season: 'Rabi', category: 'Oilseed', isActive: true },
    { name: 'Cotton', nameHindi: 'कपास', mspPrice: 7020, unit: 'quintal', season: 'Kharif', category: 'Cotton', isActive: true },
    { name: 'Chickpea (Gram)', nameHindi: 'चना', mspPrice: 5440, unit: 'quintal', season: 'Rabi', category: 'Pulse', isActive: true },
    { name: 'Soybean', nameHindi: 'सोयाबीन', mspPrice: 4600, unit: 'quintal', season: 'Kharif', category: 'Oilseed', isActive: true },
  ]);
  console.log(`✅ ${crops.length} crops seeded`);

  // ---- ADMIN ----
  console.log('👤 Seeding admin...');
  const admin = await User.create({
    name: 'System Administrator',
    mobile: '9000000001',
    email: 'admin@kisanconnect.gov.in',
    password: 'Admin@123',
    role: 'admin',
    isActive: true,
  });

  // ---- CENTRES ----
  console.log('🏢 Seeding procurement centres...');
  const [centre1, centre2, centre3] = await ProcurementCentre.insertMany([
    {
      centreId: 'KPC-LDH-001',
      name: 'Ludhiana Main Procurement Centre',
      address: 'Grain Market, Near Bus Stand, Ludhiana',
      district: 'Ludhiana',
      state: 'Punjab',
      pincode: '141001',
      contactPhone: '0161-2345678',
      contactEmail: 'ludhiana@kisanconnect.gov.in',
      operatingHours: { start: '09:00', end: '17:00' },
      dailyCapacity: 150,
      slotDurationMinutes: 60,
      avgServiceTimeMinutes: 8,
      cancellationCutoffHours: 12,
      availableCrops: [crops[0]._id, crops[1]._id, crops[2]._id, crops[3]._id],
      eligibilityDistricts: ['Ludhiana', 'Fatehgarh Sahib'],
      isActive: true,
      description: 'Primary wheat and paddy procurement centre for Ludhiana district.',
      facilities: ['Weighing Bridge', 'Storage Facility', 'Waiting Area', 'Drinking Water', 'Restrooms'],
    },
    {
      centreId: 'KPC-AMR-001',
      name: 'Amritsar Procurement Centre',
      address: 'Mandi Complex, GT Road, Amritsar',
      district: 'Amritsar',
      state: 'Punjab',
      pincode: '143001',
      contactPhone: '0183-2567890',
      contactEmail: 'amritsar@kisanconnect.gov.in',
      operatingHours: { start: '08:30', end: '16:30' },
      dailyCapacity: 120,
      slotDurationMinutes: 60,
      avgServiceTimeMinutes: 10,
      cancellationCutoffHours: 24,
      availableCrops: [crops[0]._id, crops[1]._id, crops[4]._id, crops[5]._id],
      eligibilityDistricts: ['Amritsar', 'Tarn Taran'],
      isActive: true,
      description: 'Multi-crop procurement centre serving Amritsar and Tarn Taran districts.',
      facilities: ['Weighing Machine', 'Cold Storage', 'ATM', 'Canteen'],
    },
    {
      centreId: 'KPC-PTL-001',
      name: 'Patiala District Procurement Centre',
      address: 'Old Mandi Road, Rajpura, Patiala',
      district: 'Patiala',
      state: 'Punjab',
      pincode: '147001',
      contactPhone: '0175-2234567',
      contactEmail: 'patiala@kisanconnect.gov.in',
      operatingHours: { start: '09:00', end: '17:00' },
      dailyCapacity: 200,
      slotDurationMinutes: 60,
      avgServiceTimeMinutes: 7,
      cancellationCutoffHours: 12,
      availableCrops: [crops[0]._id, crops[3]._id, crops[6]._id, crops[2]._id],
      eligibilityDistricts: ['Patiala', 'Sangrur', 'Barnala'],
      isActive: true,
      description: 'Largest procurement centre in the region. Handles wheat, mustard, and soybean.',
      facilities: ['Automated Weighing', 'Large Waiting Area', 'Solar Shade', 'Medical Aid'],
    },
  ]);
  console.log('✅ 3 centres seeded');

  // ---- OFFICERS ----
  console.log('👮 Seeding officers...');
  const officer1 = await User.create({
    name: 'Gurpreet Singh',
    mobile: '9810000001',
    email: 'officer1@kisanconnect.gov.in',
    password: 'Officer@123',
    role: 'officer',
    isActive: true,
  });
  await OfficerProfile.create({
    userId: officer1._id,
    centreId: centre1._id,
    employeeId: 'EMP-LDH-001',
    designation: 'Senior Procurement Officer',
  });
  await ProcurementCentre.findByIdAndUpdate(centre1._id, { $push: { officerIds: officer1._id } });

  const officer2 = await User.create({
    name: 'Harmandeep Kaur',
    mobile: '9820000002',
    email: 'officer2@kisanconnect.gov.in',
    password: 'Officer@123',
    role: 'officer',
    isActive: true,
  });
  await OfficerProfile.create({
    userId: officer2._id,
    centreId: centre2._id,
    employeeId: 'EMP-AMR-001',
    designation: 'Procurement Officer',
  });
  await ProcurementCentre.findByIdAndUpdate(centre2._id, { $push: { officerIds: officer2._id } });

  const officer3 = await User.create({
    name: 'Balwinder Singh',
    mobile: '9830000003',
    email: 'officer3@kisanconnect.gov.in',
    password: 'Officer@123',
    role: 'officer',
    isActive: true,
  });
  await OfficerProfile.create({
    userId: officer3._id,
    centreId: centre3._id,
    employeeId: 'EMP-PTL-001',
    designation: 'Procurement Officer',
  });
  await ProcurementCentre.findByIdAndUpdate(centre3._id, { $push: { officerIds: officer3._id } });
  console.log('✅ 3 officers seeded');

  // ---- FARMERS (15) ----
  console.log('🌾 Seeding 15 farmers...');
  const farmerData = [
    { name: 'Rajveer Singh', mobile: '9751000001', email: 'farmer@example.com', district: 'Ludhiana', village: 'Doraha', farmerId: 'FMR-LDH-001' },
    { name: 'Harjinder Kaur', mobile: '9751000002', district: 'Ludhiana', village: 'Khanna', farmerId: 'FMR-LDH-002' },
    { name: 'Sukhwinder Singh', mobile: '9751000003', district: 'Ludhiana', village: 'Machhiwara', farmerId: 'FMR-LDH-003' },
    { name: 'Manpreet Kaur', mobile: '9751000004', district: 'Ludhiana', village: 'Raikot', farmerId: 'FMR-LDH-004' },
    { name: 'Gurdeep Singh', mobile: '9751000005', district: 'Ludhiana', village: 'Samrala', farmerId: 'FMR-LDH-005' },
    { name: 'Amarjit Singh', mobile: '9751000006', district: 'Amritsar', village: 'Jandiala', farmerId: 'FMR-AMR-001' },
    { name: 'Kulwinder Kaur', mobile: '9751000007', district: 'Amritsar', village: 'Majitha', farmerId: 'FMR-AMR-002' },
    { name: 'Daljit Singh', mobile: '9751000008', district: 'Amritsar', village: 'Rayya', farmerId: 'FMR-AMR-003' },
    { name: 'Baljinder Singh', mobile: '9751000009', district: 'Patiala', village: 'Nabha', farmerId: 'FMR-PTL-001' },
    { name: 'Satinder Kaur', mobile: '9751000010', district: 'Patiala', village: 'Rajpura', farmerId: 'FMR-PTL-002' },
    { name: 'Paramjit Singh', mobile: '9751000011', district: 'Patiala', village: 'Sangrur', farmerId: 'FMR-PTL-003' },
    { name: 'Navdeep Singh', mobile: '9751000012', district: 'Ludhiana', village: 'Sidhwan Bet', farmerId: 'FMR-LDH-006' },
    { name: 'Jaspal Kaur', mobile: '9751000013', district: 'Amritsar', village: 'Tarn Taran', farmerId: 'FMR-AMR-004' },
    { name: 'Ranjit Singh', mobile: '9751000014', district: 'Patiala', village: 'Bhawanigarh', farmerId: 'FMR-PTL-004' },
    { name: 'Lakhwinder Singh', mobile: '9751000015', district: 'Ludhiana', village: 'Mullanpur', farmerId: 'FMR-LDH-007' },
  ];

  const farmers = [];
  for (const f of farmerData) {
    const user = await User.create({
      name: f.name,
      mobile: f.mobile,
      email: f.email || undefined,
      password: 'Farmer@123',
      role: 'farmer',
      isActive: true,
    });

    const centreForDistrict = f.district === 'Ludhiana' ? centre1 : f.district === 'Amritsar' ? centre2 : centre3;
    const cropForFarmer = crops[Math.floor(Math.random() * 4)];

    await FarmerProfile.create({
      userId: user._id,
      farmerIdNumber: f.farmerId,
      state: 'Punjab',
      district: f.district,
      village: f.village,
      address: `Near Panchayat Office, ${f.village}, ${f.district}, Punjab`,
      crops: [{ cropId: cropForFarmer._id, cropName: cropForFarmer.name, estimatedQuantity: Math.floor(Math.random() * 80 + 20), unit: 'quintal' }],
      isProfileComplete: true,
    });
    farmers.push({ user, district: f.district, centreForDistrict, cropForFarmer });
  }
  console.log(`✅ ${farmers.length} farmers seeded`);

  // ---- SLOTS (next 7 days for all 3 centres) ----
  console.log('📅 Generating slots...');
  const slotDocs = [];
  for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(0, 0, 0, 0);

    for (const centre of [centre1, centre2, centre3]) {
      const [startH, startM] = centre.operatingHours.start.split(':').map(Number);
      const [endH, endM] = centre.operatingHours.end.split(':').map(Number);
      let slotStart = startH * 60 + startM;
      const slotEnd = endH * 60 + endM;
      const duration = centre.slotDurationMinutes;
      const capacity = Math.floor(centre.dailyCapacity / ((slotEnd - slotStart) / duration));

      while (slotStart + duration <= slotEnd) {
        const st = `${String(Math.floor(slotStart / 60)).padStart(2, '0')}:${String(slotStart % 60).padStart(2, '0')}`;
        const et = `${String(Math.floor((slotStart + duration) / 60)).padStart(2, '0')}:${String((slotStart + duration) % 60).padStart(2, '0')}`;
        slotDocs.push({ centreId: centre._id, date: new Date(date), startTime: st, endTime: et, capacity, booked: 0, status: 'available' });
        slotStart += duration;
      }
    }
  }
  const slots = await Slot.insertMany(slotDocs);
  console.log(`✅ ${slots.length} slots generated`);

  // ---- BOOKINGS, QUEUE, PROCUREMENTS, PAYMENTS ----
  console.log('📋 Creating sample bookings with various statuses...');

  // Helper: get today's slots for a centre
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySlots = (centreId) => slots.filter(
    (s) => s.centreId.toString() === centreId.toString() &&
            s.date.getTime() === today.getTime()
  );

  const bookingScenarios = [
    // Ludhiana Centre - Today's bookings with various statuses
    { farmerIdx: 0, centreId: centre1._id, cropIdx: 0, qty: 50, status: 'payment_completed', qStatus: 'completed', procStatus: 'completed', payStatus: 'paid' },
    { farmerIdx: 1, centreId: centre1._id, cropIdx: 0, qty: 35, status: 'payment_processing', qStatus: 'completed', procStatus: 'completed', payStatus: 'processing' },
    { farmerIdx: 2, centreId: centre1._id, cropIdx: 3, qty: 60, status: 'procurement_completed', qStatus: 'completed', procStatus: 'completed', payStatus: 'pending' },
    { farmerIdx: 3, centreId: centre1._id, cropIdx: 0, qty: 45, status: 'procurement_in_progress', qStatus: 'serving', procStatus: 'in_progress', payStatus: null },
    { farmerIdx: 4, centreId: centre1._id, cropIdx: 2, qty: 30, status: 'verification', qStatus: 'waiting', procStatus: null, payStatus: null },
    { farmerIdx: 11, centreId: centre1._id, cropIdx: 0, qty: 55, status: 'arrived', qStatus: 'waiting', procStatus: null, payStatus: null },
    { farmerIdx: 14, centreId: centre1._id, cropIdx: 0, qty: 40, status: 'booked', qStatus: 'waiting', procStatus: null, payStatus: null },

    // Amritsar Centre
    { farmerIdx: 5, centreId: centre2._id, cropIdx: 0, qty: 42, status: 'payment_completed', qStatus: 'completed', procStatus: 'completed', payStatus: 'paid' },
    { farmerIdx: 6, centreId: centre2._id, cropIdx: 1, qty: 28, status: 'procurement_completed', qStatus: 'completed', procStatus: 'completed', payStatus: 'pending' },
    { farmerIdx: 7, centreId: centre2._id, cropIdx: 4, qty: 15, status: 'booked', qStatus: 'waiting', procStatus: null, payStatus: null },
    { farmerIdx: 12, centreId: centre2._id, cropIdx: 0, qty: 38, status: 'arrived', qStatus: 'waiting', procStatus: null, payStatus: null },

    // Patiala Centre
    { farmerIdx: 8, centreId: centre3._id, cropIdx: 3, qty: 65, status: 'payment_completed', qStatus: 'completed', procStatus: 'completed', payStatus: 'paid' },
    { farmerIdx: 9, centreId: centre3._id, cropIdx: 0, qty: 75, status: 'procurement_in_progress', qStatus: 'serving', procStatus: 'in_progress', payStatus: null },
    { farmerIdx: 10, centreId: centre3._id, cropIdx: 6, qty: 50, status: 'booked', qStatus: 'waiting', procStatus: null, payStatus: null },
    { farmerIdx: 13, centreId: centre3._id, cropIdx: 0, qty: 55, status: 'booked', qStatus: 'waiting', procStatus: null, payStatus: null },
  ];

  for (let i = 0; i < bookingScenarios.length; i++) {
    const s = bookingScenarios[i];
    const farmer = farmers[s.farmerIdx];
    const crop = crops[s.cropIdx];
    const centreSlots = todaySlots(s.centreId);
    if (!centreSlots.length) continue;

    const slotIndex = Math.min(i % centreSlots.length, centreSlots.length - 1);
    const slot = centreSlots[slotIndex];
    const tokenNum = i + 100;
    const token = generateToken(tokenNum);
    const bookingId = generateBookingId();

    const booking = await Booking.create({
      bookingId,
      farmerId: farmer.user._id,
      centreId: s.centreId,
      slotId: slot._id,
      cropId: crop._id,
      cropName: crop.name,
      quantity: s.qty,
      unit: 'quintal',
      token,
      bookingDate: today,
      slotStartTime: slot.startTime,
      slotEndTime: slot.endTime,
      status: s.status,
    });

    await Slot.findByIdAndUpdate(slot._id, { $inc: { booked: 1 } });

    await QueueEntry.create({
      bookingId: booking._id,
      farmerId: farmer.user._id,
      centreId: s.centreId,
      slotId: slot._id,
      token,
      position: tokenNum,
      queueDate: today,
      status: s.qStatus,
      ...(s.qStatus === 'completed' ? { completedAt: new Date() } : {}),
      ...(s.qStatus === 'serving' ? { servedAt: new Date(), counter: 'Counter 1' } : {}),
    });

    // Create procurement if applicable
    if (s.procStatus) {
      const totalAmount = s.qty * crop.mspPrice;
      const proc = await Procurement.create({
        bookingId: booking._id,
        farmerId: farmer.user._id,
        centreId: s.centreId,
        cropId: crop._id,
        cropName: crop.name,
        quantity: s.qty,
        unit: 'quintal',
        grade: ['A', 'B', 'A', 'B'][i % 4],
        pricePerUnit: crop.mspPrice,
        totalAmount,
        officerId: officer1._id,
        status: s.procStatus,
        procurementDate: s.procStatus === 'completed' ? new Date() : undefined,
        completedAt: s.procStatus === 'completed' ? new Date() : undefined,
      });

      // Create payment if applicable
      if (s.payStatus) {
        const txnId = `DEMO-TXN-${Date.now().toString(36).toUpperCase()}-${i}`;
        await Payment.create({
          procurementId: proc._id,
          bookingId: booking._id,
          farmerId: farmer.user._id,
          amount: totalAmount,
          status: s.payStatus,
          transactionId: s.payStatus === 'paid' ? txnId : undefined,
          referenceNo: s.payStatus === 'paid' ? `PFMS-${Math.random().toString(36).substring(2, 10).toUpperCase()}` : undefined,
          paymentDate: s.payStatus === 'paid' ? new Date() : undefined,
          isDemoPayment: true,
          notes: '[DEMO] Simulated payment record for demonstration purposes.',
          processedBy: officer1._id,
          paymentMethod: 'bank_transfer',
        });
      }
    }

    // Create sample notification
    await Notification.create({
      userId: farmer.user._id,
      type: 'booking_confirmed',
      title: 'Booking Confirmed ✓',
      message: `Your procurement slot is booked for ${today.toLocaleDateString('en-IN')} at ${slot.startTime}. Your token number is ${token}.`,
      isRead: i < 5,
      metadata: { bookingId: booking._id.toString(), token },
    });
  }

  // Add some upcoming bookings (next 2 days)
  console.log('📅 Creating upcoming bookings...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const tomorrowSlots = slots.filter(
    (s) => s.centreId.toString() === centre1._id.toString() &&
            s.date.getTime() === tomorrow.getTime()
  );

  if (tomorrowSlots.length >= 2) {
    for (let i = 0; i < 2 && i < farmers.slice(0, 3).length; i++) {
      const farmer = farmers[i];
      const slot = tomorrowSlots[i];
      const token = generateToken(200 + i);
      const booking = await Booking.create({
        bookingId: generateBookingId(),
        farmerId: farmer.user._id,
        centreId: centre1._id,
        slotId: slot._id,
        cropId: crops[0]._id,
        cropName: crops[0].name,
        quantity: 40 + i * 10,
        unit: 'quintal',
        token,
        bookingDate: tomorrow,
        slotStartTime: slot.startTime,
        slotEndTime: slot.endTime,
        status: 'booked',
      });
      await Slot.findByIdAndUpdate(slot._id, { $inc: { booked: 1 } });
      await QueueEntry.create({
        bookingId: booking._id,
        farmerId: farmer.user._id,
        centreId: centre1._id,
        slotId: slot._id,
        token,
        position: 200 + i,
        queueDate: tomorrow,
        status: 'waiting',
      });
      await Notification.create({
        userId: farmer.user._id,
        type: 'slot_reminder',
        title: 'Slot Reminder',
        message: `Your procurement slot is tomorrow at ${slot.startTime}. Please arrive 10 minutes early. Token: ${token}.`,
        isRead: false,
        metadata: { bookingId: booking._id.toString(), token },
      });
    }
  }

  console.log('\n✅ ========================================');
  console.log('   SEED COMPLETE — Demo Credentials');
  console.log('   ========================================');
  console.log('   ADMIN');
  console.log('   Mobile: 9000000001  |  Password: Admin@123');
  console.log('   Email: admin@kisanconnect.gov.in');
  console.log('');
  console.log('   OFFICER (Ludhiana Centre)');
  console.log('   Mobile: 9810000001  |  Password: Officer@123');
  console.log('   Email: officer1@kisanconnect.gov.in');
  console.log('');
  console.log('   FARMER (Demo)');
  console.log('   Mobile: 9751000001  |  Password: Farmer@123');
  console.log('   Email: farmer@example.com');
  console.log('   ========================================\n');

  await closeDB();
  console.log('🔌 Disconnected from PostgreSQL');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
