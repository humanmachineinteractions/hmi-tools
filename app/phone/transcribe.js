var fs = require('fs');
var utils = require('../utils/index');
var PhoneDict = require('./phonedict');
var stats = require('./stats');

// https://github.com/mscdex/spellcheck ?
function transcribe(infile, outfile, options, complete) {
  var unknown = new stats.Mapper();
  var stream = fs.createWriteStream(outfile);
  var c = 0;
  stream.once('open', function (fd) {
    var d = new PhoneDict();
    if (options.lexonly)
      d.phonesaurus = false;
    d.on('ready', function () {
      utils.readLines(infile, function (err, lines) {
        utils.forEach(lines, function (line, next) {
          line = line.replace(/-/g, ' ');
          d.getTranscriptionInfo(line, function (err, ph) {
            if (c % 100 == 0)
              console.log('at line ' + c + ' of ' + lines.length);
            c++;
            if (options.lexonly && ph.unknown.length != 0) {
              ph.unknown.forEach(function (p) {
                unknown.add(p);
              });
              process.nextTick(next);
              return;
            } else {
              stream.write(line + "\t" + ph.phones.toString() + '\n');
              process.nextTick(next);
            }
          });
        }, function () {
          console.log('read ' + c + ' lines');
          console.log('unknown', unknown.get());//TODO write that to a file to phonetize later, then compute diff between this & that
          //stream.write(JSON.stringify(unknown.get()));
          //stream.write("\n");
          stream.end();
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
  transcribe(process.argv[2], process.argv[3], {lexonly: true}, function () { //{}
    console.log("!");
  })
}