const http = require('http');

let sessionCookie = '';

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const headers = { ...options.headers };
    if (postData) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(JSON.stringify(postData));
    }
    if (sessionCookie) {
      headers['Cookie'] = sessionCookie;
    }

    const req = http.request({ ...options, headers }, (res) => {
      let data = '';
      if (res.headers['set-cookie']) {
        // Capture cookie (e.g. cv.sid)
        const rawCookies = res.headers['set-cookie'];
        const cvCookie = rawCookies.find(c => c.startsWith('cv.sid='));
        if (cvCookie) {
          sessionCookie = cvCookie.split(';')[0];
        }
      }

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

async function runTests() {
  const testUser = `student_${Date.now()}`;
  const testPassword = 'SecurePassword123!';
  let recoveryCodes = [];

  console.log(`\n================ AUTH & RECOVERY TESTS ================\n`);
  console.log(`Testing with user: ${testUser}`);

  // Test 1: Signup
  console.log('\n[TEST 1] Signup with Username & Password (No email/phone)...');
  const signupRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/signup',
    method: 'POST'
  }, {
    username: testUser,
    password: testPassword,
    confirmPassword: testPassword
  });

  if (signupRes.status !== 201 || !signupRes.data.success) {
    throw new Error(`Signup failed: ${JSON.stringify(signupRes.data)}`);
  }
  recoveryCodes = signupRes.data.data.recoveryCodes;
  console.log('✅ Signup successful! Assigned role:', signupRes.data.data.user.role);
  console.log('✅ 5 Recovery Codes Generated:', recoveryCodes);
  if (recoveryCodes.length !== 5) {
    throw new Error('Expected exactly 5 recovery codes');
  }

  // Test 2: Duplicate username rejection
  console.log('\n[TEST 2] Duplicate username prevention...');
  const dupRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/signup',
    method: 'POST'
  }, {
    username: testUser,
    password: 'AnotherPassword123!',
    confirmPassword: 'AnotherPassword123!'
  });
  if (dupRes.status === 409) {
    console.log('✅ Duplicate username correctly rejected with 409 Conflict');
  } else {
    throw new Error(`Expected 409 Conflict, got ${dupRes.status}`);
  }

  // Test 3: Check /api/auth/me (Current Session)
  console.log('\n[TEST 3] GET /api/auth/me using HTTP-only cookie...');
  const meRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET'
  });
  if (meRes.status === 200 && meRes.data.data.user.username === testUser.toLowerCase()) {
    console.log('✅ Authenticated user verified:', meRes.data.data.user.username);
    console.log('✅ Storage Quota:', meRes.data.data.user.storageLimit, 'bytes (500 MiB)');
  } else {
    throw new Error(`Failed /api/auth/me: ${JSON.stringify(meRes.data)}`);
  }

  // Test 4: Logout
  console.log('\n[TEST 4] Logout and session destruction...');
  const logoutRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/logout',
    method: 'POST'
  });
  if (logoutRes.status === 200) {
    console.log('✅ Logout successful');
  }

  // Test 5: Verify access denied after logout
  console.log('\n[TEST 5] Verifying access denied after logout...');
  const meAfterLogout = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET'
  });
  if (meAfterLogout.status === 401) {
    console.log('✅ Access correctly denied (401) after session destruction');
  } else {
    throw new Error(`Expected 401 after logout, got ${meAfterLogout.status}`);
  }

  // Test 6: Login with invalid password
  console.log('\n[TEST 6] Login with invalid password (generic error check)...');
  const badLogin = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST'
  }, {
    username: testUser,
    password: 'WrongPassword999'
  });
  if (badLogin.status === 401 && badLogin.data.message === 'Invalid username or password.') {
    console.log('✅ Generic error returned without revealing user enumeration');
  } else {
    throw new Error(`Bad login test failed: ${JSON.stringify(badLogin.data)}`);
  }

  // Test 7: Login with valid credentials
  console.log('\n[TEST 7] Login with valid credentials...');
  const goodLogin = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST'
  }, {
    username: testUser,
    password: testPassword
  });
  if (goodLogin.status === 200 && goodLogin.data.success) {
    console.log('✅ Login successful! Session cookie received.');
  } else {
    throw new Error(`Login failed: ${JSON.stringify(goodLogin.data)}`);
  }

  // Test 8: Verify recovery code
  console.log('\n[TEST 8] Verifying valid recovery code...');
  const codeToUse = recoveryCodes[0];
  const verifyCodeRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/verify-recovery-code',
    method: 'POST'
  }, {
    username: testUser,
    recoveryCode: codeToUse
  });
  if (verifyCodeRes.status === 200 && verifyCodeRes.data.data.valid) {
    console.log(`✅ Recovery code ${codeToUse} verified as valid`);
  } else {
    throw new Error(`Code verification failed: ${JSON.stringify(verifyCodeRes.data)}`);
  }

  // Test 9: Reset password using recovery code
  console.log('\n[TEST 9] Reset password using recovery code...');
  const newPassword = 'NewlyResetPassword456!';
  const resetRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/reset-password',
    method: 'POST'
  }, {
    username: testUser,
    recoveryCode: codeToUse,
    newPassword: newPassword,
    confirmPassword: newPassword
  });
  if (resetRes.status === 200 && resetRes.data.success) {
    console.log('✅ Password successfully reset');
  } else {
    throw new Error(`Password reset failed: ${JSON.stringify(resetRes.data)}`);
  }

  // Test 10: Crucial test - Try reusing the same recovery code (MUST FAIL!)
  console.log('\n[TEST 10] Reuse used recovery code (Must be rejected!)...');
  const reuseRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/verify-recovery-code',
    method: 'POST'
  }, {
    username: testUser,
    recoveryCode: codeToUse
  });
  if (reuseRes.status === 400 && reuseRes.data.message.includes('already used')) {
    console.log('✅ Reusing recovery code correctly rejected with 400 Bad Request');
  } else {
    throw new Error(`Recovery code reuse was NOT prevented: ${JSON.stringify(reuseRes.data)}`);
  }

  // Test 11: Login with new password
  console.log('\n[TEST 11] Login with new password...');
  const loginNewPass = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST'
  }, {
    username: testUser,
    password: newPassword
  });
  if (loginNewPass.status === 200 && loginNewPass.data.success) {
    console.log('✅ Signed in successfully with new password!');
  } else {
    throw new Error(`Login with new password failed: ${JSON.stringify(loginNewPass.data)}`);
  }

  // Test 12: Regenerate recovery codes
  console.log('\n[TEST 12] Regenerate 5 new recovery codes from Settings...');
  const regenRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/regenerate-recovery-codes',
    method: 'POST'
  }, {
    currentPassword: newPassword
  });
  if (regenRes.status === 200 && regenRes.data.data.recoveryCodes.length === 5) {
    console.log('✅ New recovery codes generated:', regenRes.data.data.recoveryCodes);
  } else {
    throw new Error(`Regenerating recovery codes failed: ${JSON.stringify(regenRes.data)}`);
  }

  console.log('\n🎉 ALL 12 AUTHENTICATION & RECOVERY TESTS PASSED!\n');
}

runTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
