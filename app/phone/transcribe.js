var fs = require('fs');
var utils = require('../utils/index');
var PhoneDict = require('./phonedict');

// https://github.com/mscdex/spellcheck ?
function transcribe(infile, outfile, options, complete) {
  var unknown = {};
  var stream = fs.createWriteStream(outfile);
  var l = 0;
  stream.once('open', function (fd) {
    var d = new PhoneDict();
    d.on('ready', function () {
      utils.readLines(infile, function (err, lines) {
        utils.forEach(lines, function (line, next) {
          d.getTranscriptionInfo(line, function (err, ph) {
            if (l % 100 == 0)
              console.log('at line ' + l);
            if (options.voiced) {
              stream.write(line + "\t" + ph.phones.voiced().toString() + '\n');
            } else {
              stream.write(line + "\t" + ph.phones.toString() + '\n');
            }
            l++;
            next();
          });
        }, function () {
          stream.end();
          console.log('read ' + l + ' lines');
          console.log('unknown', unknown);
          complete();
        });
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
  transcribe(process.argv[2], process.argv[3], {voiced: (process.argv.length > 4 && process.argv[4] == "voiced")}, function () { //{}
    console.log("!");
  })
}