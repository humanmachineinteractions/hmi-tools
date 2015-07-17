var fs = require('fs');
var utils = require('../utils/index');

var Translator = {
  M: {},
  H: [],
  init: function (ready) {
    utils.readLines(__dirname + '/phones-en-us.txt', function (err, lines) {
      Translator.H = lines[0].split('\t');
      for (var i = 1; i < lines.length; i++) {
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
        });
      });
    });
  },
  translate: function (line, options) {
    return this._translate(line, options);
  },
  _translate: function (line, options) {
    var in_idx = Translator.find(options.from);
    var out_idx = Translator.find(options.to);
    var ls = '';
    var ignore = false;
    var phs = Array.isArray(line) ? line : line.indexOf(' ') != -1 ? line.split(' ') : line.split('');
    phs.forEach(function (s) {
      if (s == "<") {
        ignore = true;
        return;
      }
      else if (s == ">") {
        ignore = false;
        return;
      }
      if (ignore)
        return;
      var accent = null;
      var m = s.match(/([A-Z][A-Z])([0-3])/);
      if (m) {
        s = m[1];
        accent = m[2];
      }
      var row = Translator.M[in_idx + s];
      if (options.spaced && ls.length != 0 && ls.charAt(ls.length - 1) != ' ') {
        ls += ' ';
      }
      if (!row) {
        //throw new Error("DONT KNOW")
        ls += s;
      } else {
        var ts = row[out_idx];
        //if (accent)
        //  ts += '\'';
        ls += ts;
      }
    });
    return ls;
  },
  split: function (line, type) {
    var r = [];
    var idx = Translator.find(type);
    var i = 0;
    A: while (i <= line.length) {
      var j = 3;
      while (j > 0) {
        var ts = line.substring(i, i + j);
        var f = Translator.M[idx + ts];
        if (f) {
          r.push(ts);
          i += j;
          continue A;
        }
        j--;
      }
      if (i < line.length) {
        var c = line.substring(i, i + 1);
        console.log("???", c);
        r.push(c);
      }
      i++;
    }
    return r;
  }
}

module.exports = exports = Translator;

if (!module.parent && process.argv.length > 3) {
  Translator.init(function () {
    Translator.translateFile(process.argv[2], process.argv[3], {
      from: process.argv[4],
      to: process.argv[5]
    }, function (err, r) {
      console.log(err, r);
    })
  });
}