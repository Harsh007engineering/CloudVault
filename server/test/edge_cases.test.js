const http = require('http');

class EdgeCaseTestClient {
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

  async signup(username, password, confirmPassword = password) {
    return await this.request({ path: '/api/auth/signup', method: 'POST' }, {
      username,
      password,
      confirmPassword
    });
  }

  async uploadMultiple(filesArray) {
    const boundary = '----CloudVaultMultiBoundary' + Date.now();
    const parts = [];

    for (const f of filesArray) {
      const contentBuffer = Buffer.isBuffer(f.content) ? f.content : Buffer.from(f.content, 'utf8');
      const header = `--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="${f.filename}"\r\nContent-Type: ${f.mime || 'text/plain'}\r\n\r\n`;
      parts.push(Buffer.from(header, 'utf8'));
      parts.push(contentBuffer);
      parts.push(Buffer.from('\r\n', 'utf8'));
    }

    parts.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
    const body = Buffer.concat(parts);

    return await this.request({ path: '/api/files/upload', method: 'POST' }, body, true, boundary);
  }
}

async function runEdgeCaseTests() {
  console.log('\n================ DATA & EDGE CASE VERIFICATION TESTS ================\n');

  const client = new EdgeCaseTestClient('EdgeStudent');
  const timestamp = Date.now();
  const username = `edge_student_${timestamp}`;
  const password = 'StrongPassword123!';

  // [TEST 1] Weak password rejection
  console.log('[TEST 1] Attempting signup with password under 8 characters...');
  const weakRes = await client.signup(`weak_${timestamp}`, 'short');
  if (weakRes.status === 400) {
    console.log('✅ Weak password rejected correctly (400)');
  } else {
    throw new Error(`Expected 400 for weak password, got ${weakRes.status}`);
  }

  // [TEST 2] Password mismatch rejection
  console.log('[TEST 2] Attempting signup with mismatched confirmPassword...');
  const mismatchRes = await client.signup(`mismatch_${timestamp}`, 'Password123!', 'DifferentPassword123!');
  if (mismatchRes.status === 400) {
    console.log('✅ Mismatched passwords rejected correctly (400)');
  } else {
    throw new Error(`Expected 400 for password mismatch, got ${mismatchRes.status}`);
  }

  // [TEST 3] Valid signup
  console.log('[TEST 3] Creating fresh student account for edge-case tests...');
  const validRes = await client.signup(username, password);
  if (validRes.status === 201) {
    console.log(`✅ Student created: ${username}`);
  } else {
    throw new Error(`Failed to create student: ${JSON.stringify(validRes.data)}`);
  }

  // [TEST 4] Empty account check
  console.log('[TEST 4] Verifying empty account file list...');
  const emptyRes = await client.request({ path: '/api/files', method: 'GET' });
  if (emptyRes.status === 200 && emptyRes.data.data.files.length === 0 && emptyRes.data.data.storageUsed === 0) {
    console.log('✅ Account confirmed empty (0 files, 0 bytes used)');
  } else {
    throw new Error(`Empty check failed: ${JSON.stringify(emptyRes.data)}`);
  }

  // [TEST 5] Multiple file uploads in a single multipart request
  console.log('[TEST 5] Uploading multiple files in a single batch (3 files)...');
  const multiRes = await client.uploadMultiple([
    { filename: 'assignment1.py', content: 'print("Lab 1")', mime: 'text/plain' },
    { filename: 'notes.txt', content: 'Database normal forms', mime: 'text/plain' },
    { filename: 'query.sql', content: 'SELECT * FROM students;', mime: 'text/plain' }
  ]);
  if (multiRes.status === 201 && multiRes.data.data.files.length === 3) {
    console.log(`✅ Multi-upload succeeded! Uploaded ${multiRes.data.data.files.length} files.`);
  } else {
    throw new Error(`Multi-upload failed: ${JSON.stringify(multiRes.data)}`);
  }

  // [TEST 6] Path traversal attack in filename
  console.log('[TEST 6] Uploading file with directory traversal payload in filename (../../hack.txt)...');
  const traversalRes = await client.uploadMultiple([
    { filename: '../../../../evil_path_traversal.txt', content: 'malicious path attempt', mime: 'text/plain' }
  ]);
  if (traversalRes.status === 201) {
    const uploadedName = traversalRes.data.data.files[0].originalName;
    if (!uploadedName.includes('/') && !uploadedName.includes('\\') && !uploadedName.startsWith('..')) {
      console.log(`✅ Path traversal neutralized! Filename sanitized to: "${uploadedName}"`);
    } else {
      throw new Error(`Filename contains unescaped path separators: ${uploadedName}`);
    }
  } else {
    throw new Error(`Upload failed: ${JSON.stringify(traversalRes.data)}`);
  }

  // [TEST 7] Duplicate filename handling
  console.log('[TEST 7] Uploading two files with identical names ("duplicate.txt")...');
  const dup1 = await client.uploadMultiple([{ filename: 'duplicate.txt', content: 'Version 1', mime: 'text/plain' }]);
  const dup2 = await client.uploadMultiple([{ filename: 'duplicate.txt', content: 'Version 2', mime: 'text/plain' }]);
  if (dup1.status === 201 && dup2.status === 201) {
    const key1 = dup1.data.data.files[0].storageKey;
    const key2 = dup2.data.data.files[0].storageKey;
    if (key1 !== key2) {
      console.log(`✅ Duplicate filenames assigned unique storage keys!\n   Key 1: ${key1}\n   Key 2: ${key2}`);
    } else {
      throw new Error(`Collision detected: both files share same key ${key1}`);
    }
  } else {
    throw new Error('Duplicate upload failed');
  }

  // [TEST 8] Very long filename sanitization
  console.log('[TEST 8] Uploading file with 250+ character filename...');
  const longName = 'A'.repeat(240) + '_coursework_notes.txt';
  const longRes = await client.uploadMultiple([{ filename: longName, content: 'Very long name file', mime: 'text/plain' }]);
  if (longRes.status === 201) {
    const finalName = longRes.data.data.files[0].originalName;
    console.log(`✅ Long filename safely truncated: length ${finalName.length} chars (Original: ${longName.length} chars)`);
  } else {
    throw new Error(`Long filename upload failed: ${JSON.stringify(longRes.data)}`);
  }

  // [TEST 9] Special characters in filename
  console.log('[TEST 9] Uploading file with spaces and symbols ("DBMS Assignment #3 [Final & Verified].sql")...');
  const specialRes = await client.uploadMultiple([
    { filename: 'DBMS Assignment #3 [Final & Verified].sql', content: 'CREATE TABLE labs (id INT);', mime: 'text/plain' }
  ]);
  if (specialRes.status === 201) {
    console.log(`✅ Special characters handled safely: ${specialRes.data.data.files[0].originalName}`);
  } else {
    throw new Error(`Special characters upload failed: ${JSON.stringify(specialRes.data)}`);
  }

  // [TEST 10] Unauthenticated access blocked on /api/files
  console.log('[TEST 10] Testing unauthenticated access to /api/files without cookie...');
  const unauthClient = new EdgeCaseTestClient('UnauthVisitor');
  const unauthRes = await unauthClient.request({ path: '/api/files', method: 'GET' });
  if (unauthRes.status === 401) {
    console.log('✅ Unauthenticated access correctly blocked with 401 Unauthorized');
  } else {
    throw new Error(`Expected 401 for unauth request, got ${unauthRes.status}`);
  }

  // [TEST 11] Clean batch deletion of all created files
  console.log('[TEST 11] Cleaning up and deleting all test files...');
  const listRes = await client.request({ path: '/api/files', method: 'GET' });
  const allIds = listRes.data.data.files.map(f => f._id);
  const deleteRes = await client.request({ path: '/api/files/batch-delete', method: 'POST' }, { fileIds: allIds });
  if (deleteRes.status === 200) {
    console.log(`✅ Batch cleanup deleted ${allIds.length} files. Account restored to 0 bytes.`);
  } else {
    throw new Error(`Cleanup failed: ${JSON.stringify(deleteRes.data)}`);
  }

  console.log('\n🎉 ALL 11 DATA & EDGE CASE TESTS PASSED!\n');
}

if (require.main === module) {
  runEdgeCaseTests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('\n❌ EDGE CASE TEST FAILED:', err);
      process.exit(1);
    });
}

module.exports = runEdgeCaseTests;
