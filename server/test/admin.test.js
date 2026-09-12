const http = require('http');

class TestClient {
  constructor(name) {
    this.name = name;
    this.cookie = '';
  }

  request(options, body = null) {
    return new Promise((resolve, reject) => {
      const headers = { ...(options.headers || {}) };
      if (this.cookie) {
        headers['Cookie'] = this.cookie;
      }
      if (body) {
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

        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          let data = raw;
          try {
            data = JSON.parse(raw);
          } catch (e) {}
          resolve({ status: res.statusCode, data });
        });
      });

      req.on('error', reject);
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  async login(username, password) {
    return await this.request({ path: '/api/auth/login', method: 'POST' }, { username, password });
  }

  async signup(username, password) {
    return await this.request({ path: '/api/auth/signup', method: 'POST' }, {
      username,
      password,
      confirmPassword: password
    });
  }
}

async function runAdminTests() {
  console.log('\n================ ADMIN & RECOVERY END-TO-END TESTS ================\n');

  const adminClient = new TestClient('Admin');
  const studentClient = new TestClient('Student');

  // 1. Sign up an admin user (username: admin_<timestamp> with role assigned or username 'admin')
  const timestamp = Date.now();
  const studentName = `regular_student_${timestamp}`;

  // Sign up regular student
  console.log(`[TEST 1] Registering regular student (${studentName})...`);
  const studentSignup = await studentClient.signup(studentName, 'StudentPass123!');
  if (studentSignup.status !== 201) throw new Error('Student signup failed');
  console.log('✅ Student registered');

  // Sign up admin user (by signing in as first user or user with username 'admin')
  // Note: In authController, first user created in database is admin, or username containing admin
  console.log(`[TEST 2] Registering administrator (admin)...`);
  const adminName = `admin_${timestamp}`;
  // We can promote via database or check the first user from auth.test
  // Let's test logging into the existing first user or creating admin
  const adminSignup = await adminClient.signup('admin', 'AdminPass123!');
  let adminRes = adminSignup;
  if (adminSignup.status === 409) {
    // Already created, log in
    adminRes = await adminClient.login('admin', 'AdminPass123!');
  }
  console.log('✅ Admin authenticated');

  // 2. Fetch admin metrics
  console.log('\n[TEST 3] Fetching admin metrics (Total Users, Total Files, Total Storage)...');
  const metricsRes = await adminClient.request({
    path: '/api/admin/metrics',
    method: 'GET'
  });
  if (metricsRes.status === 200 && metricsRes.data.success) {
    console.log('✅ Metrics retrieved:', metricsRes.data.data);
  } else {
    throw new Error(`Admin metrics failed: ${JSON.stringify(metricsRes.data)}`);
  }

  // 3. List users
  console.log('\n[TEST 4] Admin lists students...');
  const usersRes = await adminClient.request({
    path: `/api/admin/users?search=${studentName}`,
    method: 'GET'
  });
  if (usersRes.status !== 200 || usersRes.data.data.users.length === 0) {
    throw new Error('Failed to find created student in admin user list');
  }
  const targetStudent = usersRes.data.data.users[0];
  console.log(`✅ Student found in list: ${targetStudent.username} (ID: ${targetStudent._id})`);

  // 4. Update user quota from 500 MiB to 1000 MiB
  console.log('\n[TEST 5] Admin increases student quota to 1000 MiB...');
  const newQuotaBytes = 1000 * 1024 * 1024;
  const quotaRes = await adminClient.request({
    path: `/api/admin/users/${targetStudent._id}/quota`,
    method: 'PATCH'
  }, { storageLimitBytes: newQuotaBytes });
  if (quotaRes.status === 200 && quotaRes.data.data.user.storageLimit === newQuotaBytes) {
    console.log('✅ Quota successfully increased to 1000 MiB in database!');
  } else {
    throw new Error(`Quota update failed: ${JSON.stringify(quotaRes.data)}`);
  }

  // 5. Admin disables student account
  console.log('\n[TEST 6] Admin disables student account...');
  const disableRes = await adminClient.request({
    path: `/api/admin/users/${targetStudent._id}/status`,
    method: 'PATCH'
  }, { status: 'disabled' });
  if (disableRes.status === 200 && disableRes.data.data.user.accountStatus === 'disabled') {
    console.log('✅ Student account disabled');
  } else {
    throw new Error(`Disable user failed: ${JSON.stringify(disableRes.data)}`);
  }

  // 6. Verify disabled student CANNOT log in (403)
  console.log('\n[TEST 7] Verifying disabled student login is rejected with 403...');
  const studentDisabledLogin = await studentClient.login(studentName, 'StudentPass123!');
  if (studentDisabledLogin.status === 403 && studentDisabledLogin.data.message.includes('disabled')) {
    console.log('✅ Disabled student login correctly rejected with 403 Forbidden');
  } else {
    throw new Error(`Disabled student was able to login: ${JSON.stringify(studentDisabledLogin.data)}`);
  }

  // 7. Admin re-enables student account
  console.log('\n[TEST 8] Admin re-enables student account...');
  const enableRes = await adminClient.request({
    path: `/api/admin/users/${targetStudent._id}/status`,
    method: 'PATCH'
  }, { status: 'active' });
  if (enableRes.status === 200 && enableRes.data.data.user.accountStatus === 'active') {
    console.log('✅ Student account re-enabled');
  }

  // 8. Admin generates temporary password (lost credentials flow)
  console.log('\n[TEST 9] Admin generates temporary password for student with lost credentials...');
  const recoveryRes = await adminClient.request({
    path: `/api/admin/users/${targetStudent._id}/recovery`,
    method: 'POST'
  });
  if (recoveryRes.status !== 200 || !recoveryRes.data.data.temporaryPassword) {
    throw new Error(`Admin temporary password generation failed: ${JSON.stringify(recoveryRes.data)}`);
  }
  const tempPass = recoveryRes.data.data.temporaryPassword;
  console.log(`✅ Temporary password generated: ${tempPass}`);

  // 9. Student logs in with temporary password
  console.log('\n[TEST 10] Student logs in using temporary password...');
  const tempLoginRes = await studentClient.login(studentName, tempPass);
  if (tempLoginRes.status === 200 && tempLoginRes.data.data.forcePasswordChange === true) {
    console.log('✅ Student logged in with forcePasswordChange = true flag set!');
  } else {
    throw new Error(`Temporary login failed: ${JSON.stringify(tempLoginRes.data)}`);
  }

  // 10. Student is blocked from files until temporary password is changed
  console.log('\n[TEST 11] Verifying student is blocked from accessing files until password is changed...');
  const blockedFileAccess = await studentClient.request({
    path: '/api/files',
    method: 'GET'
  });
  if (blockedFileAccess.status === 403 && blockedFileAccess.data.errors?.forcePasswordChange) {
    console.log('✅ Access to files correctly blocked (403) while temporary password is active');
  } else {
    throw new Error(`File access was not blocked: ${JSON.stringify(blockedFileAccess.data)}`);
  }

  // 11. Student changes temporary password to a permanent password
  console.log('\n[TEST 12] Student sets permanent private password...');
  const changePassRes = await studentClient.request({
    path: '/api/auth/change-password',
    method: 'POST'
  }, {
    newPassword: 'PermanentPrivatePass123!',
    confirmPassword: 'PermanentPrivatePass123!'
  });
  if (changePassRes.status === 200 && changePassRes.data.success) {
    console.log('✅ Password successfully changed');
  } else {
    throw new Error(`Change password failed: ${JSON.stringify(changePassRes.data)}`);
  }

  // 12. Student can now access files
  console.log('\n[TEST 13] Student can now access files with new permanent credentials...');
  const allowedFileAccess = await studentClient.request({
    path: '/api/files',
    method: 'GET'
  });
  if (allowedFileAccess.status === 200) {
    console.log('✅ Access restored! Student can view files and storage quota.');
  } else {
    throw new Error(`Access still blocked after password change: ${JSON.stringify(allowedFileAccess.data)}`);
  }

  console.log('\n🎉 ALL 13 ADMIN & RECOVERY TESTS PASSED!\n');
}

runAdminTests().catch(err => {
  console.error('\n❌ Admin test suite failed:', err);
  process.exit(1);
});
