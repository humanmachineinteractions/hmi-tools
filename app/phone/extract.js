var fs = require('fs');
var path = require('path');
var iconv = require('iconv-lite');
iconv.extendNodeEncodings();
var utils = require('../utils');
var translator = require('./translate');

var input_dir = '/Users/posttool/Documents/Projects/_bk/com_nuance_zeropoint/data/Data--CorporaImposing/tom/rawdata/';
var text_out = fs.createWriteStream('/Users/posttool/Documents/github/adapt/MIN/txt.done.data');
var phseq_out = fs.createWriteStream('/Users/posttool/Documents/github/adapt/MIN/txt.phseq.data');

translator.init(function () {
  console.log(input_dir)
  fs.readdir(input_dir, function (err, files) {
    var c = 0;
    utils.forEach(files, function (file, next) {
      var ext = path.extname(file);
      var name = path.basename(file, ext);
      if (ext == '.mlf') {
        c++;
        fs.readFile(input_dir + file, 'cp437', function (err, data) {
          var lines = data.split('\n');
          var t = lines[1].substring(9).trim();
          var pt = lines[2].substring(9).trim();
          var s = translator.split(pt, 'TTN');
          var ipa = translator.translate(s, {from: 'TTN', to: 'FESTVOX', spaced: true});
          if (name.indexOf('saet') == 0 || name.indexOf('scom') == 0) {
            console.log('\n----- ' + c + ' -----')
            console.log(t);
            console.log(pt);
            console.log(name + ' ' + ipa);
            phseq_out.write(name + ' ' + ipa + '\n');
            text_out.write('( ' + name + ' "' + t + '" )\n');
          }
          next();
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