var mongoose = require('mongoose');
var prompt = require('prompt');

var current = require('../../../currently13/app/modules/cms');
var utils = require('../../../currently13/app/modules/cms/utils');

prompt.message = "create admin > ".cyan;
prompt.delimiter = "".grey;
var prompt_schema = {
    properties: {

      name: {
        required: true
      },
      email: {
        required: true
      },
      password: {
        hidden: true
      },
      confirm: {
        hidden: true
      }
    }
  };


prompt.start();

prompt.get(prompt_schema, function (err, result) {
  if (result.password != result.confirm)
    throw new Error('Password mismatch!');

  var domain = require('./index');
  var cms = new current.Cms(domain);
  var User = cms.meta.model('User');
  utils.save_user(new User(), {name: result.name, email: result.email, email_verified: true,
    password: result.password, active: true, admin: true }, function (err, user) {
    if (err)
      throw new Error(err);
    console.log('Complete', user);
  });

});