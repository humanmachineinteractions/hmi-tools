var fs = require('fs');
var audio = require('../utils/audio');
var text = require('../utils/text');
var lab2tg = require('../phone/phonelabtotextgrid');

var dir = __dirname + '/data';
var src = dir + '/jbw-src/wav2';
var dest = dir + '/jbw-voca';


function convert_audio(complete) {
  var name_map = {};
  var convert_options = {
    inputExt: '.wav',
    outputExt: '.wav',
    name: function(e){
      name_map[e] = 'hmi_us_a0_jbw_' + e.substring(e.length - 3);
      return name_map[e];
    }
  };
  var audio_options = {
    audioChannels: 1,
    audioFrequency: 16000
    //, audioFilters: ['highpass=f=80', 'lowpass=f=3000']
  };
  audio.convertDir(src+ '/wav', dest + '/wav', convert_options, audio_options, function (){
    complete(null, name_map)
  });
}


function script_to_text_with_audio(map) {
  text.readLines(src + '/script.txt', function (line) {
    var old_name = line.substring(2,10).trim();
    var name = map[old_name];
    var tt = line.substring(12, line.length -3);
    console.log(old_name, name, tt);
    if (name)
      text.writeLine(dest + '/text/' + name + '.txt', tt, function (err) {
        if (err) console.log(err);
      });
  }, function () {
    console.log('complete')
  });
}

if (process.argv[2] == 'wav')
  convert_audio(function (err, map) {
    script_to_text_with_audio(map);
  });



function convert_lab_to_textgrid() {
  lab2tg.convert(dest + '/lab', dest + '/tg', function (err) {
    if (err) console.log(err);
  });
}
if (process.argv[2] == 'tg')
  convert_lab_to_textgrid();