var config = {
  development: {
    name: 'HMI Reader',
    serverPort: 3010,
    mongoConnectString: 'mongodb://localhost/hmi',
    sessionSecret: 'fdsfdsfdsr2454r5w43tytuyik',
    kueConfigH: {
      redis: {
        port: 6379,
        host: '127.0.0.1'
      }
    },
    resourcePath: '/tmp/media/',
    storage: "local"
  },
  production: {
    name: 'HMI Reader',
    serverPort: 3010,
    mongoConnectString: 'mongodb://localhost/hmi',
    sessionSecret: 'j8o453nufsekunfsdhj',

    kueConfigH: {
      redis: {
        port: 6379,
        host: '127.0.0.1'
        // for production: {  disableSearch: true }
      }
    },
    resourcePath: '/root/media/',
    storage: "local"
  }
}

module.exports = config[process.env.NODE_ENV || 'development'];