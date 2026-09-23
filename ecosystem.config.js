module.exports = {
  apps: [
    {
      name: 'api-server',            // Name shown in `pm2 list`
      script: 'server.js',           // Script entry point
      cwd: './backend',              // Working directory
      instances: 'max',              // Run on all CPU cores
      exec_mode: 'cluster',          // Load balancer mode
      env: {                         // Environment variables
        NODE_ENV: 'production',
        PORT: 5000,
      },
      max_restarts: 10,              // Stop retrying after 10 crashes
      restart_delay: 3000,           // Wait 3 seconds before restart
      log_date_format: 'YYYY-MM-DD', // Timestamp format in logs
    },
    {
      name: 'web-client',
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      instances: 1,
      env: {
        PORT: 3000,
      },
    },
  ],
};