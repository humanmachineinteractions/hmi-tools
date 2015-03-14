var fs = require('fs');
var path = require('path');
var utils = require('../utils');

function convert(input_dir, output_dir, done) {
  fs.readdir(input_dir, function (err, files) {
    if (err) return done(err);
    utils.forEach(files, function (file, next) {
      var ext = path.extname(file);
      var name = path.basename(file, ext);
      fs.readFile(path.join(input_dir, file), 'utf8', function (err, data) {
        if (err) return done(err);
        var lines = data.split('\n');
        var phones = [];
        for (var i = 2; i < lines.length - 1; i++) {
          var t = labline(lines[i]);
          phones.push(t);
        }
        var len = phones[phones.length-1].end;
        var tg = praat_header(len) + praat_level_1n2(len, '/Users/posttool/Documents/github/hmi-www/app/build/data/dv-2-voc/wav/X_0002.wav', 'This is the utterance');
        var last = 0;
        for (var i = 0; i < phones.length; i++) {
          var ph = phones[i];
          var s = '! phones: \n3 ' + last + ' ';
          s += ph.end + '\n"' + ph.phone + '"\n\n';
          last = ph.end;
          tg += s;
        }
        fs.writeFile(path.join(output_dir, name) + '.TextGrid', tg, function (err) {
          if (err) return done(err);
          console.log(tg);
          next();
        });
      });
    }, function () {
      console.log('complete');
      return done();
    });
  });
}

function praat_header(l) {
  var s = '"Praat chronological TextGrid text file"\n\
0 ' + l + '  ! Time domain.\n\
3  ! Number of tiers.\n\
"IntervalTier" "prompts" 0 ' + l + '\n\
"IntervalTier" "utterances" 0 ' + l + '\n\
"IntervalTier" "phones" 0 ' + l + '\n\n';
  return s;
}

function praat_level_1n2(l, wav, txt) {
  var s = '! prompts:\n\
1 0 ' + l + '\n\
"' + wav + '"\n\n\
\
! utterances:\n\
2 0 ' + l + '\n\
"' + txt + '"\n\n';
  return s;
}

function labline(s) {
  var t = s.split(' ');
  return {
    end: Number(t[0]),
    index: Number(t[1]),
    phone: t[2]
  };
}

exports.convert = convert;