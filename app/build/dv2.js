var fs = require('fs');
var audio = require('../utils/audio');
var text = require('../utils/text');
var lab2tg = require('../phone/phonelabtotextgrid');

var dir = __dirname + '/data';
var src = dir + '/dv-2-src/';
var dest = dir + '/dv-2-voc/';

function mkdir(path, complete) {
  fs.mkdir(path, function (e) {
    if (!e || (e && e.code === 'EEXIST')) {
      complete(e);
    } else {
      complete(null, e);
    }
  });
}

function convert_audio() {
  audio.convertDir(src, dest + 'wav/',
    {
      inputExt: '.wav',
      outputExt: '.wav',
      name: function (n) {
        return 'X_' + n;
      }
    },
    {
      audioChannels: 1,
      audioFrequency: 22050,
      audioFilters: ['highpass=f=80', 'lowpass=f=1200']
    }
  );
}

function convert_lab_to_textgrid() {
  lab2tg.convert(dest + '/lab', dest + '/tg', function (err) {
    if (err) console.log(err);
  });
}

function script_to_text_with_audio() {
  text.readLines(src + '/script.txt', function (line) {
    var n = line.split('\t');
    fs.exists(src + '/wav/X_' + n[0] + '.wav', function (exists) {
      if (exists)
        text.writeLine(dest + '/text/X_' + n[0] + '.txt', n[1], function (err) {
          if (err) console.log(err);
        });
    });
  }, function () {
    console.log('complete')
  });
}


convert_audio();
