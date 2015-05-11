var fs = require('fs');
var utils = require('../utils/index');
var PhoneDict = require('./phonedict');

// https://github.com/mscdex/spellcheck ?
function transcribe(infile, outfile, complete) {
  var unknown = {};
  var stream = fs.createWriteStream(outfile);
  var l = 0;
  stream.once('open', function (fd) {
    var d = new PhoneDict();
    d.on('ready', function () {
      utils.readLines(infile, function (data) {
        var ph = d.getTranscriptionInfo(data);
        ph.unknown.forEach(function (p) {
          if (!unknown[p]) {
            unknown[p] = 1;
          } else {
            unknown[p]++;
          }
        });
        stream.write(ph.transcription + '\n');
        l++;
      }, function () {
        stream.end();
        console.log('read ' + l + ' lines');
        console.log('unknown', unknown)
        complete();
      });
    });
  });
}

function test() {
  var d = __dirname + '/../corpus';
  transcribe(d + '/template-0.txt', d + '/template-0.ph', function () {
    console.log("!");
  });
}

exports.transcribe = transcribe;

if (process.argv.length > 3) {
  transcribe(process.argv[2], process.argv[3], function () {
    console.log("!");
  })
}