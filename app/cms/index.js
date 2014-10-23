exports = module.exports = {
  config: require('./config'),
  models: require('./models'),
  workflow: require('./workflow'),
  permissions: require('./permission')
};


if (process.argv.length > 2) {
  var utils = require('../../../currentcms/lib/utils');
  switch (process.argv[2]) {
    case 'admin':
      utils.create_admin(module.exports);
      break;
  }
}
