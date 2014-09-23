var fs = require("fs");
var path = require("path");
var csvparse = require('csv-parse');

var r = path.join(__dirname, 'data', 'test-1-src');
var dest = path.join(__dirname, 'data', 'test-1');
fs.readdir(r, function (err, list) {
  if (err)  throw err;
  list.forEach(function (file) {
    var r1 = path.join(r, file);
    fs.readdir(r1, function (err, list) {
      if (list)
        list.forEach(function (file) {
          var ext = path.extname(file);
          if (ext == '.txt')
            parse(r1, file, function () {
            });
        });
    });
  });
});

function parse(dir, file, complete) {
  var parser = csvparse({ delimiter: '\t', escape: '"' }, function (err, data) {
    data.forEach(function (r, i) {
      if (i != 0)
        process_line(dir, i, r[0], r[1]);
    });
    console.log('----------- ' + file + ' ' + data.length)
  });
  fs.createReadStream(path.join(dir, file)).pipe(parser);
}

function process_line(dir, line, name, text) {
  var wav = path.join(dir, 'wav', '48k', fmt_line(line) + '.wav');
  var d = path.join(dest, 'wav', name);
  //console.log(wav);
  console.log(d);
  fs.createReadStream(wav).pipe(fs.createWriteStream(d));
}

function fmt_line(line) {
  var ls = '0000' + line;
  var llen = ls.length;
  return ls.substring(llen - 4);
}