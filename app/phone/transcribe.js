var fs = require('fs');
var utils = require('../utils/index');
var PhoneDict = require('./phonedict');
var stats = require('./stats');
var Stream = require('../krawl/filestream').Stream;
var cons = require('../console');

function transcribe(infile, outfile, options, complete) {
  fs.exists(infile, function (exists) {
    if (!exists){
      console.log('file does not exist');
      return;
    }
    var unknown = new stats.Mapper();
    new Stream(outfile, function (stream) {
      var d = new PhoneDict(); //TODO pass options
      if (options.lexonly)
        d.phonesaurus = false;
      d.on('ready', function () {
        utils.readLines(infile, function (err, lines) {
          var bar = new cons.ProgressBar('Processing :current of :total', {total: lines.length});
          utils.forEach(lines, function (line, next) {
            line = line.replace(/-/g, ' ');
            line = line.replace(/\./g, ' ');
            line = line.replace(/:/g, ',');
            d.getTranscriptionInfo(line, function (err, ph) {
              bar.tick();
              if (options.lexonly && ph.unknown.length != 0) {
                ph.unknown.forEach(function (p) {
                  unknown.add(p);
                });
                process.nextTick(next);
                return;
              } else {
                stream.writeln(line + "\t" + ph.phones.toString() + '\n');
                process.nextTick(next);
              }
            });
          }, function () {
            cons.log('complete');
            stream.end();
            if (options.lexonly && options.oov_out) {
              new Stream(options.oov_out, function (ostream) {
                ostream.writeln(JSON.stringify(unknown.get()));
                ostream.end();
                complete();
              });
            } else
              complete();
          });
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
  cons.welcome();
  transcribe(process.argv[2], process.argv[3], {lexonly: true, oov_out: process.argv[4]}, function () { //{}
    console.log("!");
  })
}