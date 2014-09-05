var config = {
  development: {
    name: 'HMI MetaPoint',
    serverPort: 3002,
    mongoConnectString: 'mongodb://localhost/hmi',
    sessionSecret: 'fdsfdsfdsr2454r5w43tytuyik',

    storage: "cloudinary",
    cloudinaryConfig: { cloud_name: 'hmi', api_key: '', api_secret: '' }
  },
  production: {
    name: 'HMI',
    serverPort: 3002,
    mongoConnectString: 'mongodb://localhost/hmi',
    sessionSecret: 'j8o453nufsekunfsdhj',

    storage: "cloudinary",
    cloudinaryConfig: { cloud_name: 'hmi', api_key: '', api_secret: '' }
  }
}

module.exports = config[process.env.NODE_ENV || 'development'];