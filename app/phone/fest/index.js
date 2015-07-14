var exec = require('child_process').exec;

function fest_trans_from_text(t, complete) {
  exec('/home/vagrant/sw/festival/bin/festival --script ~/app/phone/fest/trans.scm "' + t + '"', function (error, stdout, stderr) {
    if (error) return complete(error);
    complete(null, stdout.trim())
  });
}

function fest_feats_from_utt(utt, complete) {
  exec('/home/vagrant/sw/festival/bin/festival --script ~/app/phone/fest/dump.scm "' + utt + '"', function (error, stdout, stderr) {
    if (stderr) return complete(stderr)
    if (error) return complete(error);
    complete(null, stdout);
  });
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
      LD_LIBRARY_PATH: '/usr/local/lib',
      ESTDIR: '/home/vagrant/sw/speech_tools',
      FESTVOXDIR: '/home/vagrant/sw/festvox',
      SPTKDIR: '/usr/local/bin',
      FLITEDIR: '/home/vagrant/sw/flite-2.0.0-release'
    }
  }, function (err, stdout, stderr) {
    complete(err, stdout, stderr)
  })
}

function execFestvoxStream(dir, cmd, complete) {
  var util = require('util'),
    spawn = require('child_process').spawn,
    ls = spawn(cmd,[], {
      cwd: dir,
      env: {
        LD_LIBRARY_PATH: '/usr/local/lib',
        ESTDIR: '/home/vagrant/sw/speech_tools',
        FESTVOXDIR: '/home/vagrant/sw/festvox',
        SPTKDIR: '/usr/local/bin',
        FLITEDIR: '/home/vagrant/sw/flite-2.0.0-release'
      }
    });

  ls.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  ls.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  ls.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    complete();
  });
}

exports.transcriptionFromText = fest_trans_from_text;
exports.wordFeaturesFromText = fest_word_feats_from_text;
exports.dumpFromUtterance = fest_feats_from_utt;
exports.execFestvox = execFestvox;
exports.execFestvoxStream = execFestvoxStream;
