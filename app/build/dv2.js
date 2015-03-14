var fs = require('fs');
var audio = require('../utils/audio');
var text = require('../utils/text');
var lab2tg = require('../phone/phonelabtotextgrid');

var dir = __dirname + '/data';

function t2() {
  audio.convertDir(dir + '/dv-2-src/', dir + '/dv-2-voc/wav/',
    {
      inputExt: '.wav',
      outputExt: '.wav',
      namef: function (n) {
        return 'X_' + n;
      }
    },
    {audioChannels: 1, audioFrequency: 22050}
  );
}

function ta() {
  lab2tg.convert( dir + '/dv-2-voc/phonelab', dir + '/dv-2-voc/tg', function (err) {
    if (err) console.log(err);
  });
}

function ttt() {
  text.readLines(dir + '/dv-2-src/script.txt', function (line) {
    var n = line.split('\t');
    fs.exists(dir + '/dv-2-voc/wav/X_' + n[0] + ".wav", function (exists) {
      if (exists)
        text.writeLine(dir + '/dv-2-voc/text/X_' + n[0] + '.txt', n[1], function (err) {
          if (err) console.log(err);
        });
    });
  }, function () {
    console.log('complete')
  });
}

ta();