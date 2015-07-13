var fs = require('fs');
var path = require('path');
var praat = require('index');
var utils = require('../../utils/index');
var Stream = require('../../krawl/filestream').Stream;

function convert_dir(input_dir, output_dir, translator, done) {
  fs.readdir(input_dir, function (err, files) {
    if (err) return done(err);
    utils.forEach(files, function (file, next) {
      var ext = path.extname(file);
      var name = path.basename(file, ext);
      fs.readFile(path.join(input_dir, file), 'utf8', function (err, data) {
        if (err) return done(err);
        var tg = exports.convert(data, translator);
        new Stream(output_dir + '/' + name + '.TextGrid', function (out) {
          out.writeln(tg);
          out.end();
          next();
        })
      });
    });
  });
}

exports.convert = function (txt, translator) {
  var lines = txt.split('\n');
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
  delete o['Phrase'];
  sections.splice(sections.indexOf('Phrase'), 1);
  if (translator) {
    sections.push('IPA');
    o['IPA'] = [];
    o['Segments'].forEach(function (s) {
      o['IPA'].push([s[0], s[1], translator.translate([s[2]], {from: 'FESTVOX', to: 'IPA'})])
    });
  }
  return praat.TextGrid(l, sections, o);
}



if (!module.parent) {
  var translator = require('../translate');
  translator.init(function () {
    convert_dir('/Users/posttool/Documents/github/adapt/MIN/voicebo', '/Users/posttool/Documents/github/adapt/MIN/voicebx', translator, function () {
      console.log("X")
    })
  })
}