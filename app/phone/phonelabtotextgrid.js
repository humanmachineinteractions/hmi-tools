var fs = require('fs');
var path = require('path');
var utils = require('../utils');
var sax = require('sax');

function convert(input_dir, output_dir, done) {
  fs.readdir(input_dir, function (err, files) {
    if (err) return done(err);
    utils.forEach(files, function (file, next) {
      var ext = path.extname(file);
      var name = path.basename(file, ext);
      fs.readFile(path.join(input_dir, file), 'utf8', function (err, data) {
        if (err) return done(err);
        var lines = data.split('\n');
        var labphones = [];
        var last = 0;
        for (var i = 1; i < lines.length - 1; i++) {
          var t = labline(lines[i], last);
          labphones.push(t);
          last = t.end;
        }
        var lab_length = last;
        fs.readFile(path.join(input_dir, '../text', name + '.txt'), 'utf8', function (err, text) {
          if (err) text = err.toString();
          read_prompt_allophones(labphones, path.join(input_dir, '../prompt_allophones', name + '.xml'), function (err, sylls, pos) {
            if (err) console.error(err);
            // write text grid
            // var wav_path = '../wav/' + name + '.wav';
            var tg = praat_header(lab_length) + praat_level_1(lab_length, text);
            for (var i = 0; i < sylls.length; i++) {
              var syll = sylls[i];
              var xx = syll.accent ? '* ' : '';
              var s = '! syllables: \n2 ' + syll.begin + ' ' + syll.end + '\n"' + xx + syll.text + '"\n\n';
              tg += s;
            }
            for (var i = 0; i < labphones.length; i++) {
              var ph = labphones[i];
              var s = '! phones: \n3 ' + ph.begin + ' ' + ph.end + '\n"' + ph.phone + '"\n\n';
              tg += s;
            }
            fs.writeFile(path.join(output_dir, name) + '.TextGrid', tg, function (err) {
              if (err) return done(err);
              console.log('wrote ' + name + '.TextGrid');
              next();
            });
          });
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
3 ! Number of tiers.\n\
"IntervalTier" "utterances" 0 ' + l + '\n\
"IntervalTier" "syllables" 0 ' + l + '\n\
"IntervalTier" "phones" 0 ' + l + '\n\n';
  return s;
}

function praat_level_1(l, txt) {
  var s = '! utterances:\n\
1 0 ' + l + '\n\
"' + txt + '"\n\n';
  return s;
}

function labline(s, b) {
  var t = s.split(' ');
  return {
    begin: b,
    end: Number(t[0]),
    index: Number(t[1]),
    phone: t[2]
  };
}

exports.convert = convert;


function read_prompt_allophones(phones, file, complete) {
  var c = 0;

  function get_end() {
    return c == 0 ? 0 : phones[c].phone == '_' ? phones[c].end : phones[c - 1].end;
  }

  var last_syll = {time: 0};
  var sylls = [];

  function add_syll(node) {
    var e = get_end();
    if (last_syll.text)
      sylls.push({text: last_syll.text, accent: last_syll.accent, begin: last_syll.time, end: e});
    if (node) {
      last_syll.accent = node.attributes.accent;
      last_syll.text = node.attributes.ph;
      last_syll.time = e;
    }
  }

  var last_pos = {time: 0};
  var pos = [];

  function add_pos(node) {
    //console.log({pos: node.attributes.pos, transcription: node.attributes.ph});
    var e = get_end();
    if (last_pos.text)
      pos.push({text: last_pos.text, pos: last_pos.pos, begin: last_pos.time, end: e});
    if (node) {
      last_pos.pos = node.attributes.pos;
      last_pos.text = node.attributes.ph;
      last_pos.time = e;
    }
  }

  var parser = sax.parser(true);
  parser.onerror = function (e) {
    console.log("ERROR", e);
  };
  parser.onopentag = function (node) {
    if (node.name == 't' && node.attributes.ph != null) {
      add_pos(node);
    }
    if (node.name == 'syllable') {
      add_syll(node);
    }
    if (node.name == 'ph') {
      if (phones[c].phone == '_')
        c++;
      //console.log(node.attributes.p, node.attributes.p == phones[c].phone);
      c++;
    }
  };
  parser.onend = function () {
    add_syll();
    complete(null, sylls, pos);
  };
  try {
    var file_buf = fs.readFileSync(file);
    parser.write(file_buf.toString('utf8')).close();
  } catch (ex) {

  }
}

