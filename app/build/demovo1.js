var audio = require('../utils/audio');
var text = require('../utils/text');
var lab2tg = require('../phone/phonelabtotextgrid');

var dir = __dirname + '/data';
function t1() {
  audio.convertDir(dir + '/demo-vocoded-src/', dir + '/demo-vocoded-1/wav/',
    {
      inputExt: '.wav',
      outputExt: '.wav',
      name: function (n) {
        return 'X_' + n.substring(9);
      }
    },
    {audioChannels: 1, audioFrequency: 22050}
  );
}
function ta() {
  var dir = '/home/vagrant/app/build/data/demo-vocoded-1';
  lab2tg.convert(dir + '/phonelab', dir + '/tg', function (err) {
    if (err) console.log(err);
  });
}
t1();