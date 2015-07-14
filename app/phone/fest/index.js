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

function fest_word_feats_from_utt(t, complete) {
  exec('/home/vagrant/sw/festival/bin/festival --script ~/app/phone/fest/wordtrans1.scm "' + t + '"', function (error, stdout, stderr) {
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
    console.log(data);
  });

  fcmd.stderr.on('data', function (data) {
    console.error(data);
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
exports.execFestvox = execFestvox;
exports.execFestvoxStream = execFestvoxStream;
