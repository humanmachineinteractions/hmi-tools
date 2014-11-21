var config = {
  development: {
    name: 'HMI Reader',
    serverPort: 3011,
    mongoConnectString: 'mongodb://localhost/reader2',
    sessionSecret: 'fdsdffdfdfds',

    kueConfigH: {
      redis: {
        port: 6379,
        host: '127.0.0.1'
      }
    },

    storage: "cloudinary",
    cloudinaryConfig: { cloud_name: 'hmi', api_key: '', api_secret: '' }
  },
  production: {
//
  }
}

module.exports = config[process.env.NODE_ENV || 'development'];