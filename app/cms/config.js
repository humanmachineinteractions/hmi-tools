var config = {
  development: {
    name: 'HMI MetaPoint',
    serverPort: 3002,
    mongoConnectString: 'mongodb://localhost/hmi',
    sessionSecret: 'fdsfdsfdsr2454r5w43tytuyik',

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
    name: 'HMI',
    serverPort: 3002,
    mongoConnectString: 'mongodb://localhost/hmi',
    sessionSecret: 'j8o453nufsekunfsdhj',

    kueConfigH: {
      redis: {
        port: 6379,
        host: '127.0.0.1'
        // for production: {  disableSearch: true }
      }
    },

    storage: "cloudinary",
    cloudinaryConfig: { cloud_name: 'hmi', api_key: '', api_secret: '' }
  }
}

module.exports = config[process.env.NODE_ENV || 'development'];