var config = {
  development: {
    name: 'HMI Reader',
    serverPort: 3010,
    mongoConnectString: 'mongodb://localhost/hmi',
    sessionSecret: 'fdsfdsfdsr2454r5w43tytuyik',
    resourcePath: '/tmp/media/',
    kueConfigH: {
      redis: {
        port: 6379,
        host: '127.0.0.1'
      }
    },
//
//    storage: "cloudinary",
//    cloudinaryConfig: { cloud_name: 'hmi', api_key: '', api_secret: '' }
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

//    storage: "cloudinary",
//    cloudinaryConfig: { cloud_name: 'hmi', api_key: '', api_secret: '' }
  }
}

module.exports = config[process.env.NODE_ENV || 'development'];