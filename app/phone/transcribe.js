var fs = require('fs');
var utils = require('../utils/index');
var PhoneDict = require('./phonedict');
var stats = require('./stats');
var Stream = require('../utils/filestream').Stream;
var cons = require('../console');

function transcribeJson(infile, outfile, options, complete) {
  fs.exists(infile, function (exists) {
    if (!exists) {
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
            try {
              var words = JSON.parse(line);
            } catch (e) {
              console.error(e);
              process.nextTick(next);
              return;
            }
            var oline = '';
            for (var i = 0; i < words.length; i++) {
              if (words[i].pos.indexOf('-') == -1)
                oline += words[i].word + words[i].af;
            }
            oline = oline.trim();
            d.getTranscriptionInfo(words, function (err, ph) {
              bar.tick();
              if (options.lexonly && ph.unknown.length != 0) {
                ph.unknown.forEach(function (p) {
                  unknown.add(p);
                });
                process.nextTick(next);
                return;
              } else {
                stream.writeln(oline + "\t" + ph.phones.toString() + '\n');
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

function transcribeText(infile, outfile, options, complete) {
  fs.exists(infile, function (exists) {
    if (!exists) {
      console.log('file does not exist');
      return;
    }
    var unknown = new stats.Mapper();
    new Stream(outfile, function (stream) {
      var d = new PhoneDict(); //TODO pass options
      if (options.lexonly)
        d.phonesaurus = false;
      d.on('ready', function () {
        var c = 0;
        utils.readLines(infile, function (err, lines) {
          var bar = new cons.ProgressBar('Processing :current of :total', {total: lines.length});
          utils.forEach(lines, function (line, next) {
            var oline = line;
            d.getTranscriptionInfo(line, function (err, ph) {
              bar.tick();
              c++;
              if (options.lexonly && ph.unknown.length != 0) {
                ph.unknown.forEach(function (p) {
                  unknown.add(p);
                });
                process.nextTick(next);
                return;
              } else {
                var phs = ph.phones.toString();
                stream.writeln(oline + "\t" + phs + '\n');
                //console.log(oline)
                //console.log(phs)
                //console.log('...')
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
  transcribeText(d + '/template-0.txt', d + '/template-0.ph', function () {
    console.log("!");
  });
}

exports.transcribe = transcribeJson;
exports.transcribeText = transcribeText;
exports.transcribeJson = transcribeJson;

if (!module.parent) {
  cons.welcome();
  if (process.argv.length > 4)
    transcribeJson(process.argv[2], process.argv[3], {lexonly: true, oov_out: process.argv[4]}, function () { //{}
      console.log("!");
    })
  else if (process.argv.length > 3)
    transcribeText(process.argv[2], process.argv[3], {lexonly: false}, function () { //{}
      console.log("!");
    })
}