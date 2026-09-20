module.exports = {
  apps: [
    {
<<<<<<< HEAD
=======
      name: 'mindvisiontech-server',
      script: 'server.js',
      cwd: './server',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      exp_backoff_restart_delay: 1000,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
>>>>>>> 90d776bfcde4cef6d8d081326a5cde85725f725a
      name: 'mindvisiontech-client',
      script: 'npm',
      args: 'run start --prefix client',
      cwd: __dirname,
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      exp_backoff_restart_delay: 1000,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
    {
      name: 'mindvisiontech-server',
      script: 'server.js',
      cwd: `${__dirname}/server`,
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      exp_backoff_restart_delay: 1000,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
