var fs = require('fs');
var audio = require('../utils/audio');
var text = require('../utils/text');
var lab2tg = require('../phone/phonelabtotextgrid');

var dir = __dirname + '/data';
var src = dir + '/dk-1-src/';
var dest = dir + '/dk-1-voc/';


function convert_audio(complete) {
  var convert_options = {
    inputExt: '.wav',
    outputExt: '.wav',
    name: function (n) {
      return 'X_' + n;
    }
  };
  var audio_options = {
    audioChannels: 1,
    audioFrequency: 22050,
    audioFilters: ['highpass=f=80', 'lowpass=f=3000']
  };
  audio.convertDir(src, dest + 'wav/', convert_options, audio_options, complete);
}

function convert_lab_to_textgrid() {
  lab2tg.convert(dest + '/lab', dest + '/tg', function (err) {
    if (err) console.log(err);
  });
}

function script_to_text_with_audio() {
  text.readLines(src + '/script.txt', function (line) {
    var n = line.split('\t');
    fs.exists(dest + '/wav/X_' + n[0] + '.wav', function (exists) {
      if (exists)
        text.writeLine(dest + '/text/X_' + n[0] + '.txt', n[1], function (err) {
          if (err) console.log(err);
        });
    });
  }, function () {
    console.log('complete')
  });
}


convert_audio(function () {
  script_to_text_with_audio();
});

//convert_lab_to_textgrid();