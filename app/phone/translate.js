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
          var ls = this._translate(line, in_idx, out_idx);
          stream.write(ls + '\n');
          console.log(ls);
        })
      });
    });
  },
  translate: function (line, options) {
    return this._translate(line, Translator.find(options.from), Translator.find(options.to));
  },
  _translate: function (line, in_idx, out_idx) {
    var ls = '';
    var phs = line.split(' ');
    phs.forEach(function (s) {
      var row = Translator.M[in_idx + s];
      ls += ' ';
      if (!row) {
        ls += s;
      } else {
        var ts = row[out_idx];
        ls += ts;
      }
    });
    return ls;
  }
}

exports.translate = Translator.translate;
exports.translateFile = Translator.translateFile;

if (process.argv.length > 3) {
  Translator.init(function () {
    Translator.translateFile(process.argv[2], process.argv[3], {from: process.argv[4], to: process.argv[5]}, function (err, r) {
      console.log(err, r);
    })
  });
}