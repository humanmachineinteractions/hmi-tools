var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;

var iconv = require('iconv-lite');
iconv.extendNodeEncodings();
var utils = require('../utils');
var translator = require('./translate');

var input_dir = '/Users/david/Data--CorporaImposing/tom/rawdata';
var output_dir = '/Users/david/adapt/MIN';
var text_out = fs.createWriteStream(output_dir + '/txt.done.data');
var phseq_out = fs.createWriteStream(output_dir + '/txt.phseq.data');

translator.init(function () {
  console.log(input_dir)
  fs.readdir(input_dir, function (err, files) {
    var c = 0;
    utils.forEach(files, function (file, next) {
      var ext = path.extname(file);
      var name = path.basename(file, ext);
      if (ext == '.mlf') {
        c++;
        if (c > 500)
          return next();
        fs.readFile(input_dir + '/' + file, 'cp437', function (err, data) {
          var lines = data.split('\n');
          var t = lines[1].substring(9).trim();
          var pt = lines[2].substring(9).trim();
          var s = translator.split(pt, 'TTN');
          var ipa = translator.translate(s, {from: 'TTN', to: 'FESTVOX', spaced: true});
          var raw = input_dir + '/' + name + '.raw';
          fs.exists(raw, function (exists) {
            if (!exists) {
              console.log('no ' + raw);
              return next();
            }
            console.log('\n----- ' + c + ' -----')
            console.log(t);
            console.log(pt);
            console.log(name + ' ' + ipa);
            phseq_out.write(name + ' ' + ipa + '\n');
            text_out.write('( ' + name + ' "' + t + '" )\n');
            var wav = output_dir + '/wav/' + name + '.wav';
            exec('sox -r 22050 -e signed -b 16 ' + raw + ' -r 16000 ' + wav, function (err, out) {
              console.log(err, out)
              next();
            });
          })

        });
      } else {
        next();
      }
    }, function () {
      text_out.end();
      phseq_out.end();
    });
  });
});