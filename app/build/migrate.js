var fs = require("fs");
var path = require("path");
var csvparse = require('csv-parse');
var sox = require('sox');
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
    if (err) {
      console.log('parse err', file);
      return complete(err);
    }
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

var cc = 0;
function process_line(dir, line, name, text, complete) {
  var bname = path.basename(name, '.wav');
  var wav = path.join(dir, 'wav', '48k', fmt_line(line) + '.wav');
  var dwav = path.join(dest, 'wav', bname + '.htk');
  var dwav1 = path.join(dest, 'wav', bname + '.wav');
  var dtxt = path.join(dest, 'text', bname + '.txt');
  // console.log(wav);
  soxConvert(wav, dwav, function (err) {
    // console.log("sox err", err)
    fs.rename(dwav, dwav1, function () {
      fs.writeFile(dtxt, text, function (err) {
        console.log("!", cc, err, name, text);
        cc++;
        complete();
      });
    });
  });
}

function fmt_line(line) {
  var ls = '0000' + line;
  var llen = ls.length;
  return ls.substring(llen - 4);
}

function soxConvert(source, target, cb) {
  // had to modify sox node module so that it changes stuff to 16bit
  // line 126 ->       '-b', '16',
  var job = sox.transcode(source, target, {channelCount: 1, sampleRate: '16k', bits: /* see modified module */ '16k', format: 'wav'});
  job.on('error', function (err) {
    console.error(err);
    cb(err);
  });
//  job.on('progress', function (amountDone, amountTotal) {
//    console.log("progress", amountDone, amountTotal);
//  });
//  job.on('src', function (info) {
//   console.log("src info",info);
//  });
//  job.on('dest', function (info) {
//   console.log("dest info",info);
//  });
  job.on('end', function () {
//    console.log("done");
    cb();
  });
  job.start();
}

function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}