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
  ss.forEach(function (s) {
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

function get_int_events(w) {
  var ss = w.split("\n");
  var int_e = [];
  var reading = false;
  ss.forEach(function (s) {
    if (reading && s.indexOf("#") == 0) {
      reading = false;
      return;
    }
    if (s.indexOf("# IntEvents") == 0) {
      reading = true;
      return;
    }
    if (!reading)
      return;
    s = s.split(" ");
    int_e.push({end: Number(s[0]), event: s[1]});
  });
  return int_e;
}

function get_phrase_events(w) {
  var ss = w.split("\n");
  var ph_e = [];
  var reading = false;
  ss.forEach(function (s) {
    if (reading && s.indexOf("#") == 0) {
      reading = false;
      return;
    }
    if (s.indexOf("# Phrase") == 0) {
      reading = true;
      return;
    }
    if (!reading)
      return;
    s = s.split(" ");
    ph_e.push({end: Number(s[0]), phrase: s[1]});
  });
  return ph_e;
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
exports.getWords = get_words;
exports.getSegments = get_segs;
exports.getIntEvents = get_int_events;
exports.getPhraseEvents = get_phrase_events;
exports.execFestvox = execFestvox;
exports.execFestvoxStream = execFestvoxStream;
