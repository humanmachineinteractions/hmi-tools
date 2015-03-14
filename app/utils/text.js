var fs = require("fs");
var path = require("path");
var readline = require('readline');
var csvparse = require('csv-parse');
var utils = require('./index');


function read_lines(path, cb, complete) {
  if (!path || !cb || !complete)
    throw new Error('requires path as well as callback and complete handlers')
  var rd = readline.createInterface({
    input: fs.createReadStream(path),
    output: process.stdout,
    terminal: false
  });

  rd.on('line', function (line) {
    cb(line);
  });
  rd.on('close', complete);
}
exports.readLines = read_lines;


function save_line(path, text, complete) {
  fs.writeFile(path, text, function (err) {
    if (err) return complete(err);
    complete();
  });
}
exports.writeLine = save_line;

//function read_csv(path, complete) {
//  var parser = csvparse({delimiter: '\t', escape: '"'}, function (err, data) {
//    if (err) {
//      console.log('parse err', file);
//      return complete(err);
//    }
//    data.shift();
//    var i = 0;
//    utils.forEach(data, function (r, n) {
//      i++;
//      process_line(dir, i, r[0], r[1], n);
//    }, function () {
//      console.log('----------- ' + file + ' ' + data.length)
//      complete();
//    });
//  });
//  fs.createReadStream(path).pipe(parser);
//}

//var cc = 0;
//function process_line(dir, line_no, name, text, complete) {
//  var bname = path.basename(name, '.wav');
//  var wav = path.join(dir, 'wav', '48k', fmt_line(line_no) + '.wav');
//  var dwav = path.join(dest, 'wav', bname + '.htk');
//  var dwav1 = path.join(dest, 'wav', bname + '.wav');
//  var dtxt = path.join(dest, 'text', bname + '.txt');
//  // console.log(wav);
//}

//function fmt_line(line) {
//  var ls = '0000' + line;
//  var llen = ls.length;
//  return ls.substring(llen - 4);
//}

//function copy_file(source, target, cb) {
//  var cbCalled = false;
//
//  var rd = fs.createReadStream(source);
//  rd.on("error", function (err) {
//    done(err);
//  });
//  var wr = fs.createWriteStream(target);
//  wr.on("error", function (err) {
//    done(err);
//  });
//  wr.on("close", function (ex) {
//    done();
//  });
//  rd.pipe(wr);
//
//  function done(err) {
//    if (!cbCalled) {
//      cb(err);
//      cbCalled = true;
//    }
//  }
//}