var fs = require('fs');
var utils = require('../utils/index');

var Translator = {
  M: {},
  H: [],
  init: function (ready) {
    utils.readLines(__dirname + '/phones-en-us.txt', function (err, lines) {
      Translator.H = lines[3].split('\t');
      for (var i = 4; i < lines.length; i++) {
        var c = lines[i].split('\t');
        for (var j = 0; j < c.length; j++) {
          var id = j + c[j];
          console.log(id);
          Translator.M[id] = c;
        }
      }
      if (ready) ready();
    });
  },
  find: function (name) {
    for (var i = 0; i < Translator.H.length; i++) {
      if (name.toLowerCase() == Translator.H[i].toLowerCase())
        return i;
    }
    return -1;
  },
  translateFile: function (infile, outfile, options, complete) {
    var in_idx = Translator.find(options.from);
    var out_idx = Translator.find(options.to);
    var stream = fs.createWriteStream(outfile);
    stream.once('open', function (fd) {
      utils.readLines(infile, function (err, lines) {
        lines.forEach(function (line) {
          var ls = '';
          var phs = line.split(' ');
          phs.forEach(function (s) {
            var row = Translator.M[in_idx + s];
            if (!row) {
              console.log('?',s)
              ls += s;
            } else {
              var ts = row[out_idx];
              ls += ts;
            }
          });
          stream.write(ls + '\n');
          console.log(ls)
        })
      });
    });
  },
  translate: function (word, options) {
//
  }
}
Translator.init(function () {
  Translator.translateFile(__dirname + '/loga.ph0', __dirname + '/loga.ph1', {from: 'arpabet', to: 'ipa'}, function (err, r) {
    console.log(err, r);
  })
});
