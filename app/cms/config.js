var config = {
  development: {
    name: 'HMI Aegis',
    serverPort: 3011,
    mongoConnectString: 'mongodb://localhost/aegis',
    sessionSecret: 'sh89fuaflg347gargw8k-dsh8',

    kueConfigH: {
      redis: {
        port: 6379,
        host: '127.0.0.1'
      }
    },

    storage: 'file',
    fileConfig: { basePath: '/Users/david/hmi-www-audio' }
  },
  production: {
//
  }
}

module.exports = config[process.env.NODE_ENV || 'development'];
