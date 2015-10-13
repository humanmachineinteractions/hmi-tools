var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;

var iconv = require('iconv-lite');
iconv.extendNodeEncodings();
var utils = require('../utils');
var translator = require('./translate');

var input_dir = '/Users/david/Data--CorporaImposing/tom/rawdata';
var output_dir = '/Users/david/adapt/MIN';
var text_out = fs.createWriteStream(output_dir + '/txt.done.data');
var phseq_out = fs.createWriteStream(output_dir + '/txt.phseq.data');

translator.init(function () {
  console.log(input_dir)
  fs.readdir(input_dir, function (err, files) {
    var c = 0;
    utils.forEach(files, function (file, next) {
      var ext = path.extname(file);
      var name = path.basename(file, ext);
      if (ext == '.mlf') {
        c++;
        if (c > 3500)
          return next();
        fs.readFile(input_dir + '/' + file, 'cp437', function (err, data) {
          var lines = data.split('\n');
          //console.log(lines)
          var t = lines[1].substring(9).trim();
          var words = t.split(" ");
          //var pt = lines[2].substring(9).trim();
          //var s = translator.split(pt, 'TTN');
          //var arpa = translator.translate(s, {from: 'TTN', to: 'ARPABET', spaced: true});
          var pcm = input_dir + '/' + name + '.pcm';
          var raw = input_dir + '/' + name + '.raw';
          fs.exists(pcm, function (exists) {
            if (!exists) {
              console.log('no ' + pcm);
              return next();
            }
            console.log('\n----- ' + c + ' -----');
            // console.log(t);
            // console.log(pt);
            // console.log(name + ' ' + arpa.toLowerCase());
            // var textout = fs.createWriteStream(output_dir + '/text/' + name + '.txt');
            // textout.write(t);
            // textout.end();
            var mlfout = fs.createWriteStream(output_dir + '/mlf/' + name + '.txt');
            var widx = 0;
            for (var i = 4; i < lines.length; i++) {
              var pline = lines[i - 1].replace(/\r/g, '').trim();
              var line = lines[i].replace(/\r/g, '').trim();
              if (!line)
                continue;
              var psl = pline.split("    ");
              var sl = line.split("    ");
              var pp = translator.translate(psl[0], {from: 'TTN', to: 'ARPABET'}).toLowerCase();
              var p = translator.translate(sl[0], {from: 'TTN', to: 'ARPABET'}).toLowerCase();
              var pn = Number(psl[1]);
              var n = Number(sl[1]);
              if (pline == "-") {
                var b = Number(0).toFixed(6);
                mlfout.write(b + "\t" + b + "\t" + "-" + "\n");
                continue;
              } else if (pline == "-*" || (p == "_" && pp != "_") || (psl[0] == ",!")) {
                //word
                var b = Number(0).toFixed(6);
                var ww = words[widx];
                if (!ww) ww = "";
                mlfout.write(b + "\t" + b + "\t" + "_" + " " + ww + " \n");
                widx++;
                continue;
              } else if (pn && pp == p && p != "_") {
                var nn;
                for (var j = i+1; j < lines.length; j++) {
                  var nline = lines[j].replace(/\r/g, '').trim();
                  var nsl = nline.split("    ");
                  nn = Number(nsl[1]);
                  if (!isNaN(nn))
                    break;
                }
                var b = Number(pn / 1000).toFixed(6)
                var e = Number(nn / 1000).toFixed(6)
                mlfout.write(b + "\t" + e + "\t" + p + "\n");
              }
            }
            mlfout.end();
            //
            var wav = output_dir + '/wav/' + name + '.wav';
            //exec('cp ' + pcm + ' ' + raw, function (err) {
            //  exec('sox -r 22050 -e signed -b 16 ' + raw + ' -r 22050 ' + wav, function (err, out) {
            //console.log(err, out)
            next();
            //  });
            //});
          })

        });
      } else {
        next();
      }
    }, function () {
    });
  });
});