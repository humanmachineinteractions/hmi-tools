var fs = require('fs');
var path = require('path');
var iconv = require('iconv-lite');
iconv.extendNodeEncodings();
var utils = require('../utils');
var translator = require('./translate');

var input_dir = '/Users/david/Data--CorporaImposing/tom/rawdata/';
var out = fs.createWriteStream('/Users/david/adapt/MIN/txt.done.data');

translator.init(function () {
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
          var ipa = translator.translate(s, {from: 'TTN', to: 'IPA'});
          console.log('\n----- '+c+' -----')
          console.log(t);
          console.log(pt);
          console.log(ipa);
          if (c== 20)
            process.exit();
//          var l = '( ' + name + ' "' + t.trim() + '" )';
//          console.log(l);
//          out.write(l+'\n');
          next();
        });
      } else {
        next();
      }
    }, function () {
      out.end();
    });
  });
});