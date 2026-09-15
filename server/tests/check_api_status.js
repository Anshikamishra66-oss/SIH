async function checkAllApis() {
  const base = 'http://localhost:5000/api';
  const endpoints = [
    { name: 'System Health Check', method: 'GET', url: base + '/health' },
    { name: 'Crops List API', method: 'GET', url: base + '/crops' },
    { name: 'Procurement Centres API', method: 'GET', url: base + '/centres' },
    { name: 'AI Assistant Chat API', method: 'POST', url: base + '/ai/chat', body: { message: 'Namaste, check status' } },
    { name: 'Farmer OTP Request API', method: 'POST', url: base + '/auth/send-otp', body: { mobile: '9751000001' } },
  ];

  console.log('====== API STATUS REPORT ======');
  for (const ep of endpoints) {
    try {
      const start = Date.now();
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
        body: ep.body ? JSON.stringify(ep.body) : undefined,
      });
      const ms = Date.now() - start;
      const data = await res.json();
      console.log('[' + res.status + '] ' + ep.name + ' (' + ms + 'ms) -> ' + (res.ok ? 'ONLINE / OK' : 'ERROR'));
      if (ep.name === 'AI Assistant Chat API') {
        console.log('   AI Provider Source: ' + data.data?.source);
      }
    } catch (err) {
      console.log('[FAIL] ' + ep.name + ' -> ' + err.message);
    }
  }
}
checkAllApis();
