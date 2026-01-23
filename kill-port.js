const { exec } = require('child_process');

console.log('🔍 Hunting for process blocking port 4000...');

exec('netstat -ano | findstr :4000', (err, stdout, stderr) => {
  if (err || !stdout) {
    console.log('✅ Port 4000 seems free (no process found).');
    return;
  }

  const lines = stdout.split('\n');
  let killed = false;

  lines.forEach(line => {
    if (line.includes('LISTENING')) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      
      if (pid) {
        console.log(`🔫 Killing process with PID: ${pid}`);
        exec(`taskkill /PID ${pid} /F`, (killErr, killStdout, killStderr) => {
          if (killErr) {
            console.log(`❌ Failed to kill PID ${pid}: ${killErr.message}`);
          } else {
            console.log(`✅ Successfully killed process ${pid}`);
            killed = true;
          }
        });
      }
    }
  });

  if (!killed && stdout) {
    console.log('⚠️  Found usage but no LISTENING process (might be TIME_WAIT).');
    console.log(stdout);
  }
});