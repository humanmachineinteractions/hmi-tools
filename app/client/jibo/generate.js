var fs = require('fs');
var transcribe = require('../../phone/transcribe').transcribeText;
var Stream = require('../../krawl/filestream').Stream;
var utils = require('../../utils');
var corpus = require('../../corpus');
var greedy = require('../../phone/greedy').greedy;
var stats = require('../../phone/stats');

var BP = __dirname + '/data/gen/';
var title = null;
var stream;

function createScripts(which) {
  var goo = require('./goo-sheet');
  var D = require('./dynamic');
  var data = {};
  if (which)
    which.forEach(function (n) {
      data[n] = D[n];
    });
  else {
    console.log('*')
    data = D;
  }
  goo.processSheet('1C-xWDFYpjZMxorOkre372U4BzESAMOITbqhf7o3lyHc',
    function (sheet, next) {
      title = sheet.title.substring(7).toLowerCase().trim();
      if (stream)
        stream.end();
      if (!data[title]) {
        console.log('skipping "' + title + '"');
        next();
        return;
      } else {
        console.log('processing ' + sheet.title);
      }
      new Stream(BP + title + '.txt', function (out) {
        stream = out;
        next();
      });
    },
    function (row, c) {
      if (!data[title])
        return;
      var r = corpus.processRow(data[title], row);
      r.forEach(function (s) {
        console.log(s);
        stream.writeln(s);
      });
      if (c % 100 == 0)
        console.log('row ' + c);
    },
    function () {
      console.log('done create from src');
    });
}


function createTranscript(which) {
  var m = null;
  if (which) {
    m = {};
    which.forEach(function (w) {
      m[w + '.txt'] = true;
    });
  }
  fs.readdir(BP, function (err, files) {
    utils.forEach(files, function (file, next) {
      if (!m || m[file]) {
        transcribe(BP + file, BP + '../ph/' + file + '.ph', {lexonly: false}, function () { //{}
          console.log("!", file);
          next();
        });
      } else {
        next();
      }
    }, function () {
      console.log("done transcribe")
    });

  })
}
function doGreedy(which) {
  var complete = function (err) {
    if (err) console.error(err);
  };
  var m = null;
  if (which) {
    m = {};
    which.forEach(function (w) {
      m[w] = true;
    });
  }
  var already_ranked = [];
  fs.readdir(BP + '../ph/', function (err, files) {
    if (err) return complete(err);
    files.forEach(function (f) {
      if (f.indexOf('.ranked.ph') != -1) {
        already_ranked.push(f);
      }
    });
    console.log(already_ranked);
    var bigscript = [];
    utils.forEach(already_ranked, function (ranked, next) {
      utils.readLines(BP + '../ph/' + ranked, function (err, lines) {
        bigscript = bigscript.concat(lines);
        next();
      });
    }, function () {
      console.log('Excluding from ' + bigscript.length + ' lines...')
      var covered = stats.unique(bigscript, 3);
      fs.readdir(BP, function (err, files) {
        if (err) return complete(err);
        utils.forEach(files, function (file, next) {
          var name = file.substring(0, file.length - 4);
          if (!m || m[name]) {
            var f = BP + '../ph/' + name + '.ranked.ph';
            fs.exists(f, function (b) {
              if (b) {
                console.log('skipping ' + name + ' because ranked file exists...')
                next();
              } else {
                console.log('starting greedy on ' + name + '...')
                var options = {covered: covered};
                greedy(BP + '../ph/' + file + '.ph', f, options, function () {
                  utils.readLines(f, function (err, lines) {
                    bigscript = bigscript.concat(lines);
                    console.log("Recomputing stats with " + bigscript.length + " lines!");
                    covered = stats.unique(bigscript, 3);
                    next();
                  });
                });
              }
            });
          } else {
            next();
          }
        }, function () {
          console.log("done greedy")
        });
      });
    });


  });
}
function genCsv(which) {
  var m = null;
  if (which) {
    m = {};
    which.forEach(function (w) {
      m[w] = true;
    });
  }
  fs.readdir(BP, function (err, files) {
    utils.forEach(files, function (file, next) {
      var name = file.substring(0, file.length - 4);
      console.log(name)
      if (!m || m[name]) {
        var f = BP + '../ph/' + name + '.ranked.ph'
        fs.exists(f, function (b) {
          if (b) {
            var d = BP + '../tsv/' + name + '.tsv';
            new Stream(d, function (out) {
              utils.readLines(f, function (line) {
                line = line.split('\t');
                out.writeln(line[0])
              }, function () {
                out.end();
              });
            })
          } else {
            console.log("! no go !", f, b);
          }
          next();
        });
      } else {
        next();
      }
    }, function () {
      console.log("done csv")
    });
  })
}
var which = null;
if (process.argv.length > 3) {
  which = [];
  for (var i = 3; i < process.argv.length; i++)
    which.push(process.argv[i]);
}

if (process.argv[2] == 'script')
  createScripts(which);
else if (process.argv[2] == 'transcript')
  createTranscript(which);
else if (process.argv[2] == 'greedy')
  doGreedy(which);
else if (process.argv[2] == 'tsv')
  genCsv(which);