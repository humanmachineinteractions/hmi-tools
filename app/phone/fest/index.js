var exec = require('child_process').exec;
var FESTIVALDIR = process.env['FESTIVALDIR'] || '/home/vagrant/sw/festival/bin/';

function fest_trans_from_text(t, complete) {
  exec(FESTIVALDIR + 'festival --script ~/app/phone/fest/trans.scm "' + t + '"', function (error, stdout, stderr) {
    if (error) return complete(error);
    complete(null, stdout.trim())
  });
}

function fest_feats_from_utt(utt, complete) {
  exec(FESTIVALDIR + 'festival --script ~/app/phone/fest/dump.scm "' + utt + '"', function (error, stdout, stderr) {
    if (stderr) return complete(stderr)
    if (error) return complete(error);
    complete(null, stdout);
  });
}

function fest_feats_from_text(text, complete) {
  exec(FESTIVALDIR + 'festival --script ~/app/phone/fest/dump1.scm "' + text + '"', function (error, stdout, stderr) {
    if (stderr) return complete(stderr)
    if (error) return complete(error);
    complete(null, stdout);
  });
}

function fest_word_feats_from_utt(t, complete) {
  exec(FESTIVALDIR + 'festival --script ~/app/phone/fest/wordtrans1.scm "' + t + '"', function (error, stdout, stderr) {
    if (stderr) return complete(stderr)
    if (error) return complete(error);
    complete(null, stdout);
  });
}

function get_words(w) {
  var ss = w.split("\n");
  var words = [];
  var word = null;
  var word_phs;
  var word_begin = 0;
  var word_end;
  ss.forEach(function (s) {
    s = s.split(" ");
    var phone_begin = Number(s[0]);
    var phone_end = Number(s[1]);
    var we = Number(s[2]);
    var t = s[3];
    if (phone_begin == 0 && phone_end == 0 && we == 0) {
      if (t == "syl") {
        // could track
      } else {
        word += t;
      }
    } else if (we != 0) {
      if (word) {
        words.push({word: word, phs: word_phs, begin: word_begin, end: word_end});
        word_begin = word_end;
      }
      word = t;
      word_phs = "";
      word_end = we;
    } else {
      word_phs += t + " ";
    }
  });
  return words;
}


function get_segs(w) {
  var ss = w.split("\n");
  var segs = [];
  ss.forEach(function (s, i) {
    s = s.split(" ");
    var phone_begin = Number(s[0]);
    var phone_end = Number(s[1]);
    var we = Number(s[2]);
    var t = s[3];
    if (phone_begin != 0 && phone_end != 0 && we == 0) {
      segs.push({ph: t, begin: phone_begin, end: phone_end});
    }
  });
  return segs;
}

function get_chunk(w, name) {
  var ss = w.split("\n");
  var c = [];
  var reading = false;
  ss.forEach(function (s) {
    if (reading && s.indexOf("#") == 0) {
      reading = false;
      return;
    }
    if (s.indexOf("# "+name) == 0) {
      reading = true;
      return;
    }
    if (!reading)
      return;
    c.push(s.split(" "));
  });
  return c;
}

function get_int_events(w) {
  var c = get_chunk(w, "IntEvents");
  var int_e = [];
  c.forEach(function (ss) {
    int_e.push({end: Number(ss[0]), event: ss[1]});
  });
  return int_e;
}

function get_phrase_events(w) {
  var c = get_chunk(w, "Phrase");
  var ph_e = [];
  c.forEach(function (ss) {
    ph_e.push({end: Number(ss[0]), phrase: ss[1]});
  });
  return ph_e;
}

function get_words_2(w) {
  var c = get_chunk(w, "Words");
  var words = [];
  var word_begin = 0, word_end;
  for (var i=0; i<c.length; i++) {
    var ss = c[i];
    word_end = Number(ss[0]);
    words.push({word: ss[1], begin: word_begin, end: word_end});
    word_begin = word_end;
  }
  return words;
}


function fest_word_feats_from_text(t, complete) {
  exec('/home/vagrant/sw/festival/bin/festival --script ~/app/phone/fest/wordtrans.scm "' + t + '"', function (error, stdout, stderr) {
    if (stderr) return complete(stderr)
    if (error) return complete(error);
    complete(null, stdout);
  });
}

function execFestvox(cmd, complete) {
  exec(cmd, {
    env: {
      ESTDIR: '/home/vagrant/sw/speech_tools',
      FESTVOXDIR: '/home/vagrant/sw/festvox',
      SPTKDIR: '/usr/local',
      FLITEDIR: '/home/vagrant/sw/flite-2.0.0-release'
    }
  }, function (err, stdout, stderr) {
    complete(err, stdout, stderr)
  })
}

function execFestvoxStream(dir, cmd, complete) {
  var util = require('util'),
    spawn = require('child_process').spawn,
    fcmd = spawn(cmd, [], {
      cwd: dir,
      env: {
        PATH: '/home/vagrant/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/opt/vagrant_ruby/bin',
        ESTDIR: '/home/vagrant/sw/speech_tools',
        FESTVOXDIR: '/home/vagrant/sw/festvox',
        SPTKDIR: '/usr/local',
        FLITEDIR: '/home/vagrant/sw/flite-2.0.0-release'
      }
    });

  fcmd.stdout.on('data', function (data) {
    console.log(data + "");
  });

  fcmd.stderr.on('data', function (data) {
    console.error(data + "");
  });

  fcmd.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    complete();
  });
}

exports.transcriptionFromText = fest_trans_from_text;
exports.wordFeaturesFromText = fest_word_feats_from_text;
exports.wordFeaturesFromUtt = fest_word_feats_from_utt;
exports.dumpFromUtterance = fest_feats_from_utt;
exports.dumpFromText = fest_feats_from_text;
exports.getWords = get_words;
exports.getWordsD = get_words_2;
exports.getSegments = get_segs;
exports.getIntEvents = get_int_events;
exports.getPhraseEvents = get_phrase_events;
exports.execFestvox = execFestvox;
exports.execFestvoxStream = execFestvoxStream;
