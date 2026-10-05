const { spawn } = require('child_process');
const path = require('path');

const tests = [
  'health.test.js',
  'auth.test.js',
  'files_security.test.js',
  'admin.test.js',
  'features_upgrade.test.js',
  'edge_cases.test.js'
];

async function runTest(file) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶ Running ${file}...`);
    const proc = spawn('node', [`"${path.join(__dirname, file)}"`], {
      stdio: 'inherit',
      shell: true
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Test file ${file} failed with exit code ${code}`));
      }
    });
  });
}

async function main() {
  console.log('====================================================');
  console.log('🧪 CLOUDVAULT FULL AUTOMATED VERIFICATION TEST SUITE');
  console.log('====================================================');

  for (const test of tests) {
    await runTest(test);
  }

  console.log('\n====================================================');
  console.log('✅ ALL TEST SUITES COMPLETED SUCCESSFULLY! (100% PASS)');
  console.log('====================================================\n');
}

main().catch(err => {
  console.error('\n❌ Test execution halted:', err.message);
  process.exit(1);
});
