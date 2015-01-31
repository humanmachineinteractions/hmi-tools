var fs = require("fs");
var path = require("path");
var csvparse = require('csv-parse');
var sox = require('sox');
var utils = require('../utils')
var iconv = require('iconv-lite');
iconv.extendNodeEncodings();

var mlf_src = path.join(__dirname, 'data', 'test-3', 'mlf');
var pcm_src = path.join(__dirname, 'data', 'test-3', 'pcm');
var dest = path.join(__dirname, 'data', 'test-3');

fs.readdir(pcm_src, function (err, list) {
  if (err)  throw err;
  utils.forEach(list, function (file, next) {
    var pcm = path.join(pcm_src, file);
    var bname = path.basename(pcm, '.pcm');
    var mlf = path.join(mlf_src, bname + '.mlf');
    fs.readFile(mlf, 'cp437', function (err, data) {
      if (err) throw new Error(err);
      var d = data.split("\n");
      for (var i=0; i< d.length; i++)
      console.log(i,d[i]);
      next();
    });
  }, function () {
    console.log("done")
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