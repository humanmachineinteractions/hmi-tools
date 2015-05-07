var utils = require('../utils');
var CmuDict = require('../phone/cmu/cmudict')
var d = new CmuDict();
d.on('ready', function () {
  utils.readLines(__dirname + '/template-0.txt', function (data) {
    console.log(d.getTranscription(data));
  }, function () {
  });
});