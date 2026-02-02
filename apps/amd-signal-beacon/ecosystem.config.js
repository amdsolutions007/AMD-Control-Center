module.exports = {
  apps: [
    {
      name: 'amd-signal-beacon',
      script: 'npm',
      args: 'start',
      cwd: '/Users/mac/Desktop/AMD_Control_Center/apps/amd-signal-beacon',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
      },
    },
  ],
};
