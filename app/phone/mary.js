var fs = require('fs');
var util = require('util');
var forever = require('forever-monitor');
var request = require('request');
var xml2js = require('xml2js');
var _ = require('lodash');
var utils = require('../utils');

var maryServer;
exports.startMaryServer = function (complete) {
  if (maryServer) return complete();
  maryServer = forever.start([ 'sh', '/home/vagrant/marytts/target/marytts-5.2-SNAPSHOT/bin/marytts-server.sh'], {
    max: 1,
    silent: true
  });
  maryServer.on('stderr', function (data) {
    if (data[0] == 0x0a) {
      setTimeout(complete, 500);
    }
  });
}

exports.transcribe = function (s, complete) {
  request.post('http://localhost:59125/process', {form: {
      INPUT_TEXT: s,
      INPUT_TYPE: "TEXT",
      OUTPUT_TYPE: "PHONEMES",//"ALLOPHONES",
      LOCALE: "en_US"
    }},
    function (err, response, body) {
      if (err) return complete(err);
      if (response.statusCode != 200) return complete(response.statusCode);
      xml2js.parseString(body, function (err, data) {
        if (err) return complete(err);
        var root = data.maryxml.p[0].voice[0].s; // seems to be the root... todo verify
        var p = [];
        _.each(root, function (s) {
          _.each(s.t, function (t) {
            var orig = t._.trim();
            var transcription = t.$.ph;
            var pos = t.$.pos;
            p.push({pos: pos, original: orig, transcription: transcription});
          })
        });
        if (complete)
          complete(null, p);
      });
    })
};

exports.transcribeFile = function (input, output, complete) {
  var out = fs.createWriteStream(output)
  var lines = [];
  utils.readLines(input, function (line) {
    lines.push(line);
    console.log(line);
  }, function () {
    utils.forEach(lines, function (line, n) {
      exports.transcribe(line, function (err, pt) {
        var s = '';
        for (var i = 0; i < pt.length; i++) {
          if (pt[i] && pt[i].transcription) {
            var r = pt[i].transcription.split(" ");
            s += r.join('') + ' ';
          }
        }
        console.log(line, s);
        out.write(s + '\n');
        n();
      })

    }, complete);
  });
}

function test() {
  exports.transcribe("Different languages are, in fact, different, and I don't think there's an answer to the question you're asking. You could ask about specific languages, or what language would be best for that sort of manipulation. –  David Thornley Jun 17 '10 at 17:23");
  exports.transcribe("We are the world's largest and most comprehensive directory and search engine for acronyms, abbreviations and initialisms on the Internet. Abbreviations.com holds hundreds of thousands of entries organized by a large variety of categories from computing and the Web to governmental, medicine and business and it is maintained and expanded by a large community of passionate editors. Read more about our awards and press coverage.");
  exports.transcribe("I have been using Netbeans for a while now, and I every now and then I discover new things, it is a very sophisticated piece of code that never ceases to amaze me.");
  exports.transcribe("Note: I always keep something like Sublime Text or Atom installed for quick editing, most of the time I don’t open Netbeans if it is only to edit a comma or to add a brake line.");
  exports.transcribe("Are you using Netbeans or another IDE? Share your experience in a comment!");
}
