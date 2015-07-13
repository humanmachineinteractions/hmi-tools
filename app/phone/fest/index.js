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

function fest_word_feats_from_text(utt, complete) {
  exec('/home/vagrant/sw/festival/bin/festival --script ~/app/phone/fest/wordfeats.scm "' + utt + '"', function (error, stdout, stderr) {
    if (stderr) return complete(stderr)
    if (error) return complete(error);
    complete(null, stdout);
  });
}

exports.transcriptionFromText = fest_trans_from_text;
exports.wordFeaturesFromText = fest_word_feats_from_text;
exports.dumpFromUtterance = fest_feats_from_utt;
