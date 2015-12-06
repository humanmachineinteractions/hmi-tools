var fs = require('fs');
var _ = require('lodash');
var ProgressBar = require('progress');
var utils = require('../utils');
var PhoneDict = require('./phonedict');
var stats = require('./stats');
var translator = require('./translate');
var cons = require('../console');
var colors = require('colors');

var N = 2;
var X = 4;

// read file, prepare for transcription if necessary
function greedy(infile, outfile, options, complete) {
  var max_len = options.max_line_length ? options.max_line_length : 110;
  var min_len = options.min_line_length ? options.min_line_length : 30;
  var lines = [];
  if (options.type == 'plain-text') {
    var d = new PhoneDict();
    d.on('ready', function () {
      utils.readLines(infile, function (err, tlines) {
        var unique = {};
        for (var n = N; n < X; n++) {
          _.assign(unique, stats.unique(tlines, n));
        }
        utils.forEach(tlines, function (line, next) {
          if (line.length < min_len || line.length > max_len) return next();
          d.getTranscriptionInfo(line, function (err, s) {
            lines.push({line: line, transcription: s.transcription, phones: s.phones.voiced()});
            return next();
          });
        }, function () {
          doGreedy(lines, unique, null, fs.createWriteStream(outfile), complete);
        });
      });
    });
  } else if (!options.type || options.type == "tsv") {
    var split_char = options.csv_split_char ? options.csv_split_char : '\t';
    var tcol = options.text_column ? Number(options.text_column) : 0;
    var pcol = options.transcription_column ? Number(options.transcription_column) : 1;
    utils.readLines(infile, function (err, tlines) {
      var unique = {};
      for (var n = N; n < X; n++) {
        _.assign(unique, stats.unique(tlines, n));
      }
      utils.forEach(tlines, function (line, next) {
        var csvline = line.split(split_char);
        var text = csvline[tcol];
        if (csvline.length == 2 && text.length > min_len && text.length < max_len)
          lines.push({line: text, transcription: csvline[pcol], phones: csvline[pcol].split(' ')});
        process.nextTick(next);
      }, function () {
        if (options.covered) {
          if (typeof(options.covered) == 'string')
            utils.readLines(options.covered, function (err, covered_lines) {
              doGreedy(lines, unique, stats.unique(covered_lines, 3), fs.createWriteStream(outfile), complete);
            });
          else
            doGreedy(lines, unique, options.covered, fs.createWriteStream(outfile), complete);
        } else {
          doGreedy(lines, unique, null, fs.createWriteStream(outfile), complete);
        }
      });
    });
  } else {
    console.log("unknown " + options.type);
  }
}

// TODO use
// var Worker = require('webworker-threads').Worker;

function getBigStats(Utterance, q, workLog, complete) {
  var bigStatsFile = __dirname + '/greedyStats.json';
  fs.exists(bigStatsFile, function(b){
    if (b) {
      fs.readFile(bigStatsFile, function(err,data){
        return complete(err, JSON.parse(data.toString()));
      })
    } else {
      var lines = [];
      var stream = Utterance.find(q).stream();
      workLog("Gathering text for language statistics.");
      stream.on('data', function (doc) {
        if (Math.random()>.7) { // random sample
          lines.push(lineFromUtt(doc));
          if (lines.length % 10000 == 0) {
            workLog("Found "+lines.length+" lines...");
          }
        }
      }).on('close', function () {
        shuffle(lines);
        workLog("Found "+lines.length+" total lines. Generating statistics.");
        var unique = {};
        for (var n = N; n < X; n++) {
          _.assign(unique, stats.unique(lines, n));
        }
        fs.writeFile(bigStatsFile, JSON.stringify(unique), function(err){
          complete(lines, unique);
        })
      });
    }
  });

}
function prepareScript1(Utterance, job, workLog, complete) {
  var lines = [];
  var q = {transcription: {$ne: null}, domain: {$in: job.data.kwargs.domains}};
  var stream = Utterance.find(q).stream();
  workLog("Collecting utterances.");
  stream.on('data', function (doc) {
    if (Math.random() > .2 && doc.orthography.length > 30 && doc.orthography.length < 145) {
      lines.push(lineFromUtt(doc));
      if (lines.length % 10000 == 0) {
        workLog("Collected "+lines.length+" lines.");
      }
    }
  }).on('close', function () {
    shuffle(lines);
    workLog("Found "+lines.length+" utterances. Generating statistics.");
    var unique = {};
    for (var n = N; n < X; n++) {
      _.assign(unique, stats.unique(lines, n));
    }
    var results = [];
    doGreedy(lines, unique, null, results, function(){
      complete(null, results);
    }, workLog, Number(job.data.kwargs.total));
  });
}

function prepareScript2(Utterance, tlines, total, workLog, complete) {
  var lines = [];
  var d = new PhoneDict();
  d.on('ready', function () {
    getBigStats(Utterance, {transcription: {$ne: null}}, workLog, function(bigLines, unique){
      workLog("Generating transcriptions.");
      utils.forEach(tlines, function (line, next) {
        d.getTranscriptionInfo(line, function (err, s) {
          lines.push({line: line, transcription: s.transcription, phones: s.phones.voiced()});
          if (lines.length % 1000 == 0) {
            workLog("Transcribed "+lines.length+" lines.");
          }
          setTimeout(next,10);
        });
      }, function () {
        shuffle(lines);
        workLog("Generating statistics.");
        var results = [];
        doGreedy(lines, unique, null, results, function(){
          complete(null, results);
        }, workLog, total);
      });
    });
  });



}

function lineFromUtt(doc) {
  return {
    id: doc._id,
    line: doc.orthography,
    transcription:  doc.transcription,
    phones: doc.transcription.split(' ')
  };
}


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/**
 * This is an optimization technique for constructing a subset of sentences from a large set of sentences
 * to cover the largest unit space with the smallest number of sentences.
 *
 * Algorithm works step−by−step: a first sentence is selected according to a criterion; the sentence is added to the cover,
 * and the covered units are removed from the set of units to cover. The process starts again: the second sentence, in this
 * example, contains a maximum of non−already covered units. The process stops when all units are covered.
 *
 * @param lines {Array} a list of objects {line: "text", transcription: "T EE S"}
 * @param unique {Object}
 * @param covered {Object} a map of phones to ignore (optional)
 * @param out the output stream
 * @param complete
 */



function doGreedy(lines, unique, covered, out, complete, workLog, max) {

  if (max == null) max = 5000;
  if (workLog) {
    workLog("Ranking "+max+" of "+lines.length+" lines.");
  }

  /**
   * Step 1: Generate a unique nphone list from the corpus.
   */
  function step_1() {
    _.each(unique, function (n) {
      n.init = 0;
      n.final = 0;
    });
    console.log('Unique groups ' + _.keys(unique).length);
    if (covered) {
      _.each(covered, function (p) {
        if (unique[p.nphone]) {
          delete unique[p.nphone];
        }
      });
      console.log(' ... after excluding covered ' + _.keys(unique).length);
    }
  }

  /**
   * Step 2: Calculate frequency of the nphone in the list from the corpus.
   * Step 3: Calculate weight of each nphone in the list where weight of a nphone is inverse of the frequency.
   */
  function step_2_and_3() {
    var total = 0;
    _.each(unique, function (n) {
      total += n.count;
    });
    _.each(unique, function (n) {
      n.frequency = n.count / total;
    });
    _.each(unique, function (n) {
      n.weight = 1 - n.frequency;
    });
  }

  /**
   * Step 4: Calculate a score for every sentence.
   * Step 5: Select the highest scored sentence.
   */
  function step_4_and_5() {
    _.each(lines, function (line) {
      var score = 0;
      for (var n = N; n < X; n++) {
        stats.forNphone(n, line.phones, function (nph) {
          if (unique[nph])
            score += 1 / (unique[nph].frequency);
        });
      }
      line.score = score;
    });
    lines.sort(function (a, b) {
      return b.score - a.score;
    });
  }

  /**
   * Step 6: Delete the selected sentence from the corpus.
   * Step 7: Delete all the nphones found in the selected sentence from the nphone list.
   * Step 8: Repeat from Step 2 to 7 until the nphone list is empty.
   * @returns {Array} a ranked list of lines
   */
  var c = 0;

  function step_2_through_7() {
    setTimeout(function(){
      step_2_and_3();
      setTimeout(function(){
        step_4_and_5();
        setTimeout(function(){
          var selected = lines.shift();
          c++;

          if (out.write) {
            out.write(selected.line + "\t" + selected.transcription + "\n");
          } else if (Array.isArray(out)){
            out.push(selected);
          }
          for (var n = N; n < X; n++) {
            stats.forNphone(n, selected.phones, function (nphone, aphone, idx, s) {
              if (unique[nphone]) {
                delete unique[nphone];
              }
            });
          }
          //
          var phone_count = _.keys(unique).length;
          console.log(phone_count + " " + lines.length + " " + c + "  " + selected.line);// + "\n        " + selected.transcription);
          if (workLog != null) {
            workLog("Line " + c + "  " + selected.line);
          }
          if (c >= max || phone_count == 0) {
            if (out.end) {
              out.end();
            }
            return complete(null, lines);
          }
          setTimeout(step_2_through_7, 200);
        }, 200)
      }, 200)
    }, 200)
    //
  }

  step_1();
  step_2_through_7();

}


///


exports.greedy = greedy;
exports.doGreedy = doGreedy;
exports.ranked = prepareScript1;
exports.ranked2 = prepareScript2;


if (!module.parent) {
  cons.welcome('Script ranking aka the Greedy algorithm');
  if (process.argv.length < 4) {
    cons.log('Requires infile and outfile');
    return;
  }
  var options = {};
  translator.init(function () {
    console.log('Translator ' + translator.translate("R EH1 D IY0", {from: "ARPABET", to: "IPA"}))
    var options = {};
    if (process.argv.length > 4)
      options.covered = process.argv[4];
    greedy(process.argv[2], process.argv[3], options, function () {
      console.log("!");
    });
  });

}
