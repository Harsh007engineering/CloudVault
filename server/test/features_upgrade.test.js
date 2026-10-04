const http = require('http');

const PORT = 5000;
const HOST = '127.0.0.1';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = body;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function extractCookie(headers) {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return null;
  return setCookie[0].split(';')[0];
}

async function runFeatureTests() {
  console.log('\n================ PREMIUM FEATURE UPGRADE TESTS ================');
  const timestamp = Date.now();
  const username = `premium_student_${timestamp}`;
  const password = 'SuperSecretPassword123!';

  // 1. Signup
  console.log('\n[TEST 1] Registering student user...');
  const signupRes = await request({
    hostname: HOST,
    port: PORT,
    path: '/api/auth/signup',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ username, password, confirmPassword: password }));

  const cookie = extractCookie(signupRes.headers);
  console.log('✅ Student registered and session cookie obtained');

  // 2. Upload two test files using multipart boundary
  console.log('\n[TEST 2] Uploading File 1 (document) and File 2 (code)...');
  const boundary = '----CloudVaultBoundary' + timestamp;
  
  // File 1 upload (.txt)
  const file1Content = 'Lab Notes 2026 for CS Course';
  let body1 = `--${boundary}\r\n`;
  body1 += `Content-Disposition: form-data; name="files"; filename="notes.txt"\r\n`;
  body1 += `Content-Type: text/plain\r\n\r\n`;
  body1 += `${file1Content}\r\n`;
  body1 += `--${boundary}--\r\n`;

  const upload1 = await request({
    hostname: HOST,
    port: PORT,
    path: '/api/files/upload',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Cookie': cookie,
      'Content-Length': Buffer.byteLength(body1)
    }
  }, body1);
  const file1 = upload1.data.data.files[0];
  console.log(`✅ Uploaded file 1: ${file1.originalName} (ID: ${file1._id})`);

  // File 2 upload (.png)
  const boundary2 = '----CloudVaultBoundary2' + timestamp;
  const file2Content = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C489', 'hex');
  const file2Header = `--${boundary2}\r\nContent-Disposition: form-data; name="files"; filename="diagram.png"\r\nContent-Type: image/png\r\n\r\n`;
  const file2Footer = `\r\n--${boundary2}--\r\n`;
  const body2 = Buffer.concat([Buffer.from(file2Header), file2Content, Buffer.from(file2Footer)]);

  const upload2 = await request({
    hostname: HOST,
    port: PORT,
    path: '/api/files/upload',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary2}`,
      'Cookie': cookie,
      'Content-Length': body2.length
    }
  }, body2);
  const file2 = upload2.data.data.files[0];
  console.log(`✅ Uploaded file 2: ${file2.originalName} (ID: ${file2._id})`);

  // 3. Test File Star / Favorite
  console.log('\n[TEST 3] Star File 1...');
  const starRes = await request({
    hostname: HOST,
    port: PORT,
    path: `/api/files/${file1._id}/star`,
    method: 'PATCH',
    headers: { 'Cookie': cookie }
  });
  if (starRes.status !== 200 || !starRes.data.data.file.isStarred) {
    throw new Error('Failed to star file: ' + JSON.stringify(starRes.data));
  }
  console.log('✅ File 1 is now starred');

  // 4. Test Query Filter: ?starred=true
  console.log('\n[TEST 4] Query ?starred=true...');
  const starredListRes = await request({
    hostname: HOST,
    port: PORT,
    path: '/api/files?starred=true',
    method: 'GET',
    headers: { 'Cookie': cookie }
  });
  const starredFiles = starredListRes.data.data.files;
  if (starredFiles.length !== 1 || starredFiles[0]._id !== file1._id) {
    throw new Error(`Expected 1 starred file, got: ${starredFiles.length}`);
  }
  console.log(`✅ Query returned exactly 1 starred file: ${starredFiles[0].originalName}`);

  // 5. Test Storage Category Breakdown Stats
  console.log('\n[TEST 5] GET /api/files/stats breakdown...');
  const statsRes = await request({
    hostname: HOST,
    port: PORT,
    path: '/api/files/stats',
    method: 'GET',
    headers: { 'Cookie': cookie }
  });
  if (statsRes.status !== 200 || !statsRes.data.data.breakdown) {
    throw new Error('Failed to get storage stats: ' + JSON.stringify(statsRes.data));
  }
  console.log('✅ Category Breakdown:', statsRes.data.data.breakdown);
  console.log(`✅ Total files reported: ${statsRes.data.data.totalFiles}`);

  // 6. Test Inline Download Preview (Content-Disposition: inline)
  console.log('\n[TEST 6] GET /api/files/:id/download?inline=true...');
  const inlineRes = await request({
    hostname: HOST,
    port: PORT,
    path: `/api/files/${file1._id}/download?inline=true`,
    method: 'GET',
    headers: { 'Cookie': cookie }
  });
  const contentDisp = inlineRes.headers['content-disposition'];
  if (!contentDisp || !contentDisp.startsWith('inline')) {
    throw new Error(`Expected inline Content-Disposition, got: ${contentDisp}`);
  }
  console.log(`✅ Content-Disposition verified as inline: "${contentDisp}"`);
  console.log(`✅ Content preview: "${inlineRes.data}"`);

  // 7. Test Batch Deletion
  console.log('\n[TEST 7] Batch Deleting both files [file1, file2]...');
  const batchDeleteRes = await request({
    hostname: HOST,
    port: PORT,
    path: '/api/files/batch-delete',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    }
  }, JSON.stringify({ fileIds: [file1._id, file2._id] }));

  if (batchDeleteRes.status !== 200 || batchDeleteRes.data.data.deletedCount !== 2) {
    throw new Error('Batch delete failed: ' + JSON.stringify(batchDeleteRes.data));
  }
  console.log(`✅ Batch delete succeeded. Deleted ${batchDeleteRes.data.data.deletedCount} files.`);
  console.log(`✅ Reclaimed ${batchDeleteRes.data.data.reclaimedBytes} bytes.`);

  // 8. Verify files list is now empty
  const finalListRes = await request({
    hostname: HOST,
    port: PORT,
    path: '/api/files',
    method: 'GET',
    headers: { 'Cookie': cookie }
  });
  if (finalListRes.data.data.files.length !== 0) {
    throw new Error('Files list should be empty after batch deletion');
  }
  console.log('✅ File list successfully verified as empty (0 files)');

  console.log('\n🎉 ALL 7 PREMIUM FEATURE UPGRADE TESTS PASSED!\n');
}

runFeatureTests().catch(err => {
  console.error('\n❌ Feature test failed:', err);
  process.exit(1);
});
