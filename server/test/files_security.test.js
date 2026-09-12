const http = require('http');

class TestClient {
  constructor(name) {
    this.name = name;
    this.cookie = '';
  }

  request(options, body = null, isMultipart = false, boundary = '') {
    return new Promise((resolve, reject) => {
      const headers = { ...(options.headers || {}) };
      if (this.cookie) {
        headers['Cookie'] = this.cookie;
      }
      if (isMultipart) {
        headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
        headers['Content-Length'] = body.length;
      } else if (body) {
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
      }

      const req = http.request({
        hostname: '127.0.0.1',
        port: 5000,
        ...options,
        headers
      }, (res) => {
        if (res.headers['set-cookie']) {
          const cvCookie = res.headers['set-cookie'].find(c => c.startsWith('cv.sid='));
          if (cvCookie) {
            this.cookie = cvCookie.split(';')[0];
          }
        }

        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const rawBuffer = Buffer.concat(chunks);
          const contentType = res.headers['content-type'] || '';
          let data = null;

          if (contentType.includes('application/json')) {
            try {
              data = JSON.parse(rawBuffer.toString('utf8'));
            } catch (e) {
              data = rawBuffer.toString('utf8');
            }
          } else {
            data = rawBuffer;
          }

          resolve({ status: res.statusCode, data, headers: res.headers });
        });
      });

      req.on('error', reject);
      if (isMultipart) {
        req.write(body);
      } else if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  async signup(username, password) {
    const res = await this.request({ path: '/api/auth/signup', method: 'POST' }, {
      username,
      password,
      confirmPassword: password
    });
    return res;
  }

  async uploadFile(filename, content, mime = 'text/plain') {
    const boundary = '----CloudVaultTestBoundary' + Date.now();
    const contentBuffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');

    const header = `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;

    const body = Buffer.concat([
      Buffer.from(header, 'utf8'),
      contentBuffer,
      Buffer.from(footer, 'utf8')
    ]);

    return await this.request({ path: '/api/files/upload', method: 'POST' }, body, true, boundary);
  }
}

async function runFileAndSecurityTests() {
  console.log('\n================ FILE & SECURITY ISOLATION TESTS ================\n');

  const clientA = new TestClient('UserA');
  const clientB = new TestClient('UserB');
  const timestamp = Date.now();
  const userA_name = `student_a_${timestamp}`;
  const userB_name = `student_b_${timestamp}`;

  // 1. Sign up User A
  console.log(`[TEST 1] Registering User A (${userA_name})...`);
  const signupA = await clientA.signup(userA_name, 'PasswordA123!');
  if (signupA.status !== 201) throw new Error('User A signup failed');
  console.log('✅ User A created successfully');

  // 2. Sign up User B
  console.log(`[TEST 2] Registering User B (${userB_name})...`);
  const signupB = await clientB.signup(userB_name, 'PasswordB123!');
  if (signupB.status !== 201) throw new Error('User B signup failed');
  console.log('✅ User B created successfully');

  // 3. User A uploads private file
  console.log('\n[TEST 3] User A uploads "lab_report.txt"...');
  const fileContent = 'CS401 Lab Report - Confidential University Research';
  const uploadRes = await clientA.uploadFile('lab_report.txt', fileContent, 'text/plain');
  if (uploadRes.status !== 201 || !uploadRes.data.success) {
    throw new Error(`Upload failed: ${JSON.stringify(uploadRes.data)}`);
  }
  const userA_file = uploadRes.data.data.files[0];
  console.log('✅ File uploaded. ID:', userA_file._id, 'Storage Key:', userA_file.storageKey);
  console.log('✅ Storage used updated to:', uploadRes.data.data.storageUsed, 'bytes');

  // 4. User A downloads their own file
  console.log('\n[TEST 4] User A downloads "lab_report.txt"...');
  const downloadResA = await clientA.request({
    path: `/api/files/${userA_file._id}/download`,
    method: 'GET'
  });
  if (downloadResA.status !== 200) {
    throw new Error(`Download failed with status: ${downloadResA.status}`);
  }
  const downloadedText = downloadResA.data.toString('utf8');
  if (downloadedText !== fileContent) {
    throw new Error('Downloaded content mismatch');
  }
  console.log('✅ Content matches perfectly!');
  console.log('✅ Cache-Control header verified:', downloadResA.headers['cache-control']);
  if (!downloadResA.headers['cache-control']?.includes('no-store')) {
    throw new Error('Missing no-store Cache-Control header!');
  }

  // 5. CRITICAL SECURITY TEST: User B attempts to access User A's file
  console.log('\n[TEST 5] CRITICAL SECURITY TEST: User B attempts to read User A\'s file metadata...');
  const userB_getA = await clientB.request({
    path: `/api/files/${userA_file._id}`,
    method: 'GET'
  });
  if (userB_getA.status === 404) {
    console.log('✅ User B gets 404 Not Found (Cross-user metadata leak prevented!)');
  } else {
    throw new Error(`SECURITY VULNERABILITY: User B received status ${userB_getA.status}`);
  }

  // 6. CRITICAL SECURITY TEST: User B attempts to download User A's file
  console.log('\n[TEST 6] CRITICAL SECURITY TEST: User B attempts to download User A\'s file...');
  const userB_downloadA = await clientB.request({
    path: `/api/files/${userA_file._id}/download`,
    method: 'GET'
  });
  if (userB_downloadA.status === 404) {
    console.log('✅ User B gets 404 Not Found (Cross-user file download blocked!)');
  } else {
    throw new Error(`SECURITY VULNERABILITY: User B downloaded User A file! Status: ${userB_downloadA.status}`);
  }

  // 7. CRITICAL SECURITY TEST: User B attempts to rename User A's file
  console.log('\n[TEST 7] CRITICAL SECURITY TEST: User B attempts to rename User A\'s file...');
  const userB_renameA = await clientB.request({
    path: `/api/files/${userA_file._id}`,
    method: 'PATCH'
  }, { newName: 'hacked_report.txt' });
  if (userB_renameA.status === 404) {
    console.log('✅ User B gets 404 Not Found (Cross-user rename blocked!)');
  } else {
    throw new Error(`SECURITY VULNERABILITY: User B renamed User A file! Status: ${userB_renameA.status}`);
  }

  // 8. CRITICAL SECURITY TEST: User B attempts to delete User A's file
  console.log('\n[TEST 8] CRITICAL SECURITY TEST: User B attempts to delete User A\'s file...');
  const userB_deleteA = await clientB.request({
    path: `/api/files/${userA_file._id}`,
    method: 'DELETE'
  });
  if (userB_deleteA.status === 404) {
    console.log('✅ User B gets 404 Not Found (Cross-user delete blocked!)');
  } else {
    throw new Error(`SECURITY VULNERABILITY: User B deleted User A file! Status: ${userB_deleteA.status}`);
  }

  // 9. Unsupported file type upload rejection (.exe)
  console.log('\n[TEST 9] Uploading unsupported file type (malicious.exe)...');
  const exeUpload = await clientA.uploadFile('malicious.exe', 'MZ90000', 'application/x-msdownload');
  if (exeUpload.status === 400 && exeUpload.data.message.includes('not supported')) {
    console.log('✅ Unsupported executable correctly rejected with 400 Bad Request');
  } else {
    throw new Error(`Executable was not rejected: ${JSON.stringify(exeUpload.data)}`);
  }

  // 10. User A renames file
  console.log('\n[TEST 10] User A renames "lab_report.txt" to "final_lab_report.txt"...');
  const renameRes = await clientA.request({
    path: `/api/files/${userA_file._id}`,
    method: 'PATCH'
  }, { newName: 'final_lab_report' });
  if (renameRes.status === 200 && renameRes.data.data.file.originalName === 'final_lab_report.txt') {
    console.log('✅ File successfully renamed and extension preserved:', renameRes.data.data.file.originalName);
  } else {
    throw new Error(`Rename failed: ${JSON.stringify(renameRes.data)}`);
  }

  // 11. Search files
  console.log('\n[TEST 11] Search files by query "final"...');
  const searchRes = await clientA.request({
    path: '/api/files?search=final',
    method: 'GET'
  });
  if (searchRes.status === 200 && searchRes.data.data.files.length === 1) {
    console.log('✅ Search returned matching file:', searchRes.data.data.files[0].originalName);
  } else {
    throw new Error(`Search failed: ${JSON.stringify(searchRes.data)}`);
  }

  // 12. User A deletes file & verifies quota recovery
  console.log('\n[TEST 12] User A deletes file and reclaims storage...');
  const deleteRes = await clientA.request({
    path: `/api/files/${userA_file._id}`,
    method: 'DELETE'
  });
  if (deleteRes.status === 200 && deleteRes.data.data.storageUsed === 0) {
    console.log('✅ File deleted and storage quota reclaimed to 0 bytes');
  } else {
    throw new Error(`Delete failed: ${JSON.stringify(deleteRes.data)}`);
  }

  // 13. Regular user forbidden from admin routes
  console.log('\n[TEST 13] Regular student blocked from admin endpoints (403 Forbidden)...');
  const adminRes = await clientB.request({
    path: '/api/admin/metrics',
    method: 'GET'
  });
  if (adminRes.status === 403) {
    console.log('✅ Regular student correctly received 403 Forbidden for admin endpoint');
  } else {
    throw new Error(`Expected 403, got ${adminRes.status}`);
  }

  console.log('\n🎉 ALL 13 FILE & SECURITY ISOLATION TESTS PASSED!\n');
}

runFileAndSecurityTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
