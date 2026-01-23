const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Starting server diagnostic...\n');

// Change to backend-core directory
process.chdir(path.join(__dirname, 'backend-core'));

let errorOutput = '';
let successOutput = '';

console.log('📁 Working directory:', process.cwd());
console.log('🚀 Starting server with: npm run dev\n');

const server = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  shell: true
});

server.stdout.on('data', (data) => {
  const message = data.toString();
  successOutput += message;
  console.log('📢 STDOUT:', message.trim());
});

server.stderr.on('data', (data) => {
  const message = data.toString();
  errorOutput += message;
  console.log('❌ STDERR:', message.trim());
});

server.on('error', (err) => {
  console.log('💥 Spawn Error:', err.message);
});

server.on('close', (code) => {
  console.log(`\n🔒 Server process exited with code ${code}`);
  
  // Analyze common errors
  if (errorOutput.includes('Cannot find module')) {
    console.log('\n🎯 ERROR: Missing dependencies - run "npm install"');
  }
  
  if (errorOutput.includes('ECONNREFUSED') || errorOutput.includes('connection')) {
    console.log('\n🎯 ERROR: Database connection failed - check DATABASE_URL in .env');
  }
  
  if (errorOutput.includes('EADDRINUSE')) {
    console.log('\n🎯 ERROR: Port 4000 is already in use - kill existing process');
  }
  
  if (errorOutput.includes('OPENAI_API_KEY')) {
    console.log('\n🎯 ERROR: OpenAI API key missing - add to .env file');
  }
  
  console.log('\n📊 Full Error Output:');
  console.log(errorOutput);
});

// Keep the process alive for 10 seconds to capture startup
setTimeout(() => {
  console.log('\n⏰ Stopping diagnostic after 10 seconds...');
  server.kill();
}, 10000);