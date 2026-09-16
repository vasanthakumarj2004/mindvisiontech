module.exports = {
  apps: [
    {
      name: 'mindvisiontech-app',
      script: 'npm',
      args: 'run start --prefix client',
      cwd: __dirname,
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
  ],
};
