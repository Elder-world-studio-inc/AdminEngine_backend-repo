module.exports = {
  apps: [
    {
      name: "admin-backend",
      script: "src/index.js",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M", // Restarts if memory exceeds 500MB
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    }
  ]
};
