var fs = require('fs');
var audio = require('../utils/audio');
var text = require('../utils/text');
var lab2tg = require('../phone/phonelabtotextgrid');

var dir = __dirname + '/data';
var src = dir + '/jbw-src/';
var dest = dir + '/jbw-voc/';


function convert_audio(complete) {
  var convert_options = {
    inputExt: '.wav',
    outputExt: '.wav'
  };
  var audio_options = {
    audioChannels: 1,
    audioFrequency: 22050
    //, audioFilters: ['highpass=f=80', 'lowpass=f=3000']
  };
  audio.convertDir(src, dest + 'wav/', convert_options, audio_options, complete);
}


function script_to_text_with_audio() {
  text.readLines(src + '/script.txt', function (line) {
    var n = line.split('\t');
    fs.exists(dest + '/wav/' + n[0] + '.wav', function (exists) {
      if (exists)
        text.writeLine(dest + '/text/' + n[0] + '.txt', n[1], function (err) {
          if (err) console.log(err);
        });
    });
  }, function () {
    console.log('complete')
  });
}

if (process.argv[2] == 'wav')
  convert_audio(function () {
    script_to_text_with_audio();
  });



function convert_lab_to_textgrid() {
  lab2tg.convert(dest + '/lab', dest + '/tg', function (err) {
    if (err) console.log(err);
  });
}
if (process.argv[2] == 'tg')
  convert_lab_to_textgrid();