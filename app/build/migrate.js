var fs = require("fs");
var path = require("path");
var csvparse = require('csv-parse');
var utils = require('../utils')

var r = path.join(__dirname, 'data', 'test-1-src');
var dest = path.join(__dirname, 'data', 'test-1');
fs.readdir(r, function (err, list) {
  if (err)  throw err;
  list.forEach(function (file) {
    var r1 = path.join(r, file);
    fs.readdir(r1, function (err, list) {
      if (list)
        utils.forEach(list, function (file, next) {
          var ext = path.extname(file);
          if (ext == '.txt')
            parse(r1, file, next);
        }, function () {
          console.log("DONE")
        });
    });
  });
});

function parse(dir, file, complete) {
  var parser = csvparse({ delimiter: '\t', escape: '"' }, function (err, data) {
    data.shift();
    var i = 0;
    utils.forEach(data, function (r, n) {
      i++;
      process_line(dir, i, r[0], r[1], n);
    }, function () {
      console.log('----------- ' + file + ' ' + data.length)
      complete();
    });
  });
  fs.createReadStream(path.join(dir, file)).pipe(parser);
}

function process_line(dir, line, name, text, complete) {
  var wav = path.join(dir, 'wav', '48k', fmt_line(line) + '.wav');
  var dwav = path.join(dest, 'wav', name);
  var bname = path.basename(name, '.wav');
  var dtxt = path.join(dest, 'text', bname + '.txt');
  //console.log(wav);
  //fs.createReadStream(wav).pipe(fs.createWriteStream(dwav));
  fs.writeFile(dtxt, text, function (err) {
    console.log("!", err, text)
    complete();
  });
}

function fmt_line(line) {
  var ls = '0000' + line;
  var llen = ls.length;
  return ls.substring(llen - 4);
}