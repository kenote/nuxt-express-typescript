// PM2 Configure
const pkg = require('./package.json')

module.exports = {
  apps : [
    {
      name: pkg.name,
      script: './build/index.js',
      watch: true,
      max_memory_restart: '300M',
      interpreter_args: '--harmony',
      instances: 1,
      // instance_var: 'INSTANCE_ID',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}