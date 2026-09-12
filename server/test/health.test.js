const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Health Check Response:', JSON.stringify(parsed, null, 2));
      if (res.statusCode === 200 && parsed.success === true) {
        console.log('✅ Health check PASSED');
        process.exit(0);
      } else {
        console.error('❌ Health check FAILED with status:', res.statusCode);
        process.exit(1);
      }
    } catch (e) {
      console.error('❌ Failed to parse response:', data, e);
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
  process.exit(1);
});

req.end();
