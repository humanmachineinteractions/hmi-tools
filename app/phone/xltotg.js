var fs = require('fs');
var path = require('path');
var utils = require('../utils');
var Stream = require('../krawl/filestream').Stream;

function convert(input_dir, output_dir, done) {
  fs.readdir(input_dir, function (err, files) {
    if (err) return done(err);
    utils.forEach(files, function (file, next) {
      var ext = path.extname(file);
      var name = path.basename(file, ext);
      fs.readFile(path.join(input_dir, file), 'utf8', function (err, data) {
        if (err) return done(err);
        var lines = data.split('\n');
        var section, sections = [], m, pm, o = {}, l = 0;
        lines.forEach(function (line) {
          if (line.match(/# /)) {
            section = line.substring(2);
            sections.push(section);
            o[section] = [];
            pm = null;
          } else if (m = line.match(/(\d+\.\d+) (\d+\.\d+) (\w+)/)) {
            o[section].push([m[1], m[2], m[3]]);
            l = Math.max(l, m[2]);
          } else if (m = line.match(/(\d+\.\d+) (.+)/)) {
            var w = m[2];
            if (w == 'NONE')
              w = '';
            else if (w.indexOf(";") != -1)
              w = w.substring(m[2].length - 2);
            if (pm) {
              o[section].push([pm[1], m[1], w]);
            } else {
              o[section].push([0, m[1], w]);
            }
            pm = m;
          }
        });
        var tg = praat_tg(l, sections, o);
        new Stream(output_dir + '/' + name + '.TextGrid', function (out) {
          out.writeln(tg);
          out.end();
          next();
        })
      });
    });
  });
}

function praat_tg(l, sections, data) {
  var s = '"Praat chronological TextGrid text file"\n';
  s += '0 ' + l + '  ! Time domain.\n';
  s += sections.length + ' ! Number of tiers.\n';
  sections.forEach(function (section) {
    s += '"IntervalTier" "' + section + '" 0 ' + l + '\n';
  })
  s += '\n';
  sections.forEach(function (section, idx) {
    data[section].forEach(function (line) {
      s += '! ' + section + ':\n';
      s += '' + (idx + 1) + ' ' + line[0] + ' ' + line[1] + '\n';
      s += '"' + line[2].trim() + '"\n\n';
    })
  })
  return s;
}

convert('/Users/posttool/Documents/github/adapt/MIN/voicebo', '/Users/posttool/Documents/github/adapt/MIN/voicebx', function () {
  console.log("X")
})