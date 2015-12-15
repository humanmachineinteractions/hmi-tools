var fs = require('fs');
var xlsjs = require('xlsx');
var utils = require('../utils');
var exec = require('child_process').exec;

var B = '/Users/david/Data--CorporaImposing/mf/scripts';
var D = '/Users/david/adapt/MIN/';

function b() {
  var script_out = fs.createWriteStream(__dirname + '/sc.txt');
  fs.readdir(B, function (err, files) {
    utils.forEach(files, function (file, next) {
      if (file.indexOf('.') == 0) return next();
      console.log(B + '/' + file + '/' + file + '.xls');
      var workbook = xlsjs.readFile(B + '/' + file + '/' + file + '.xls');
      var sheet_name_list = workbook.SheetNames;
      sheet_name_list.forEach(function (y) {
        var worksheet = workbook.Sheets[y];
        for (var z in worksheet) {
          if (z[0] === '!') continue;
          var c = z.charAt(0);
          var r = parseInt(z.substring(1));
          var o = worksheet[z].v;
          if (r > 2) {
            if (c == 'B') {
              script_out.write(o + '\n');
            }
          }
        }
      });
      next();
    }, function () {
      script_out.end();
    });
  });
}

function a() {
  var script_out = fs.createWriteStream(D + '/txtm.done.data');
  var lines = [];
  fs.readdir(B, function (err, files) {
    utils.forEach(files, function (file, next) {
      if (file.indexOf('.') == 0 || file.indexOf('mfs') == -1) return next();
      console.log(B + '/' + file + '/' + file + '.xls');
      var workbook = xlsjs.readFile(B + '/' + file + '/' + file + '.xls');
      var sheet_name_list = workbook.SheetNames;
      sheet_name_list.forEach(function (y) {
        var worksheet = workbook.Sheets[y];
        var pcm_file, wav_name;
        for (var z in worksheet) {
          if (z[0] === '!') continue;
          var c = z.charAt(0);
          var r = parseInt(z.substring(1));
          var o = worksheet[z].v;
          if (r > 2) {
            if (c == 'A') {
              var pcm = B + '/' + file + '/pcm/22k_pad/' + pad(r - 1, 4) + '.pcm';
              if (fs.existsSync(pcm)) {
                pcm_file = pcm;
                wav_name = o;
              }
            } else if (c == 'B') {
              lines.push([pcm_file, wav_name, o]);
            }
          }
        }
      });
      next();
    }, function () {
      var c = 0;
      utils.forEach(lines, function (line, next) {
        c++;
        if (c > 600) {
          process.nextTick(next);
          return;
        }
        var pcm = line[0];
        var wav = line[1];
        var raw_path = D + '/wavm/' + wav + '.raw';
        var wav_path = D + '/wavm/' + wav;
        var id = wav.substring(0, wav.length - 4);
        exec('cp ' + pcm + ' ' + raw_path, function (err, out) {
          if (err) console.log(err, out)
          exec('sox -r 22050 -e signed -b 16 ' + raw_path + ' -r 16000 ' + wav_path, function (err, out) {
            if (err) console.log(err, out);
            exec('rm ' + raw_path, function (err, out) {
              if (err) console.log(err, out);
              script_out.write('( ' + id + ' "' + line[2] + '" )\n');
              console.log(c + ' ' + id);
              process.nextTick(next);
            });
          });
        })

      }, function () {
        script_out.end();
        console.log('complete');
      });
    })
  });
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

b();