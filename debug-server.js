const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Starting server with detailed debugging...\n');

// Change to backend-core directory
process.chdir(path.join(__dirname, 'backend-core'));

let stdout = '';
let stderr = '';
let crashDetected = false;

console.log('📁 Working directory:', process.cwd());

// Start the server
const server = spawn('node', ['src/index.js'], {
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

server.stdout.on('data', (data) => {
  const message = data.toString();
  stdout += message;
  console.log('📢 STDOUT:', message.trim());
  
  // Check if server actually started listening
  if (message.includes('Server is running')) {
    console.log('\n✅ Server claims to be running - testing connectivity...');
    setTimeout(testConnection, 1000);
  }
});

server.stderr.on('data', (data) => {
  const message = data.toString();
  stderr += message;
  console.log('❌ STDERR:', message.trim());
  crashDetected = true;
});

server.on('error', (err) => {
  console.log('💥 Spawn Error:', err.message);
  crashDetected = true;
});

server.on('exit', (code, signal) => {
  console.log(`\n🔒 Server process exited with code ${code} and signal ${signal}`);
  
  if (code !== 0 && !crashDetected) {
    console.log('\n🎯 SILENT CRASH DETECTED: Server exited with non-zero code but no error output');
    console.log('This usually means:');
    console.log('1. Unhandled promise rejection');
    console.log('2. Database connection timeout');
    console.log('3. Missing environment variable');
    console.log('4. Port binding issue');
  }
  
  if (stderr) {
    console.log('\n📊 Full Error Output:');
    console.log(stderr);
  }
});

// Test actual connectivity
function testConnection() {
  console.log('\n🧪 Testing server connectivity...');
  
  const http = require('http');
  
  const req = http.request({
    hostname: 'localhost',
    port: 4000,
    path: '/',
    method: 'GET',
    timeout: 5000
  }, (res) => {
    console.log(`✅ Server responded with status: ${res.statusCode}`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('📄 Response body:', data);
      console.log('\n🎉 SUCCESS: Server is actually working!');
      process.exit(0);
    });
  });
  
  req.on('error', (err) => {
    console.log(`❌ Connection failed: ${err.message}`);
    console.log('\n🎯 This confirms the server is NOT actually listening despite claiming to be');
    console.log('Possible causes:');
    console.log('1. Server crashed after logging "Server is running"');
    console.log('2. Server bound to wrong network interface');
    console.log('3. Port conflict or permission issue');
    process.exit(1);
  });
  
  req.on('timeout', () => {
    console.log('❌ Connection timeout - server not responding');
    req.destroy();
  });
  
  req.end();
}

// Keep running for 15 seconds to catch delayed crashes
setTimeout(() => {
  if (!crashDetected) {
    console.log('\n⏰ No crash detected in 15 seconds - server appears stable');
  }
  console.log('\n🔍 Killing server process...');
  server.kill('SIGTERM');
}, 15000);