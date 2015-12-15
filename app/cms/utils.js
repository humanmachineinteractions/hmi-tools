var utils = require('../../../currentcms/lib/utils');

if (process.argv.length > 2) {
  switch (process.argv[2]) {
    case 'admin':
      utils.create_admin({
        config: require('./config'),
        models: require('./models'),
        workflow: require('./workflow'),
        permissions: require('./permission')
      });
      break;
  }
}
