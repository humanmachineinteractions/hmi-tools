var fs = require('fs');
var _ = require('lodash');
var utils = require('../utils');
var PhoneDict = require('./phonedict');
var stats = require('./stats');


function greedy(infile, outfile, options, complete) {
  var out = fs.createWriteStream(outfile);
  var d = new PhoneDict();
  d.on('ready', function () {
    var c = 0;
    var lines = [];
    var max_len = options.max_line_length ? options.max_line_length ? 130;
    utils.readLines(infile, function (err, tlines) {
      utils.forEach(tlines, function (line, next) {
        if (line.length > max_len) return next();
        if (c % 10 == 0)
          console.log('at line ' + c);
        if (c % 100 == 0)
          console.log(lines[lines.length - 1]);
        c++;
        // simple line, no options
        if (!options.type || options.transcription) {
          d.getTranscriptionInfo(line, function (err, s) {
            lines.push({line: line, transcription: s.transcription, phones: s.phones.voiced()});
            return next();
          });
        } else if (options.type == "csv") { //todo validate options
          var split_char = options.csv_split_char ? options.csv_split_char : '\t';
          var tcol = options.text_column ? Number(options.text_column) : 0;
          var pcol = options.transcription_column ? Number(options.transcription_column) : 1;
          var csvline = line.split(split_char);
          lines.push({line: csvline[tcol], transcription: csvline[pcol], phones: csvline[pcol].split(' ')});
          return next();
        }
      }, function () {
        doGreedy(lines, out, complete);
      });
    });
  });
}


/**
 * This is an optimization technique for constructing a subset of sentences from a large set of sentences
 * to cover the largest unit space with the smallest number of sentences.
 *
 * Algorithm works step−by−step: a first sentence is selected according to a criterion; the sentence is added to the cover,
 * and the covered units are removed from the set of units to cover. The process starts again: the second sentence, in this
 * example, contains a maximum of non−already covered units. The process stops when all units are covered.
 *
 * @param lines {Array} a list of objects {line: "text", transcription: "T EE S
 * @param out
 * @param complete
 */
function doGreedy(lines, out, complete) {
  // di, tri, quad
  var N = 3;
  var forPhone = function (phones, cb) {
    stats.forNphone(N, phones, cb);
  };
  // dictionary of unique nphones
  var unique = {};

  /**
   * Step 1: Generate a unique diphone list from the corpus.
   */
  function step_1() {
    unique = stats.unique(lines, N);
  }

  /**
   * Step 2: Calculate frequency of the diphone in the list from the corpus.
   * Step 3: Calculate weight of each diphone in the list where weight of a diphone is inverse of the frequency.
   */
  function step_2_and_3() {
    var total = 0;
    _.each(unique, function (diphone) {
      total += diphone.count;
    });
    _.each(unique, function (diphone) {
      diphone.frequency = diphone.count / total;
    });
    _.each(unique, function (diphone) {
      diphone.weight = 1 - diphone.frequency;
    });
  }

  /**
   * Step 4: Calculate a score for every sentence. The sentence score is defined by the equation.
   * Step 5: Select the highest scored sentence.
   */
  function step_4_and_5() {
    _.each(lines, function (line) {
      var score = 0;
      forPhone(line.phones, function (diphone) {
        if (unique[diphone]) // only diphones we are tracking
          score += 1 / (unique[diphone].frequency);
      });
      line.score = score;
    });
    lines.sort(function (a, b) {
      return b.score - a.score;
    });
  }

  /**
   * Step 6: Delete the selected sentence from the corpus.
   * Step 7: Delete all the diphones found in the selected sentence from the diphone list.
   * Step 8: Repeat from Step 2 to 7 until the diphone list is empty.
   * @returns {Array} a ranked list of lines
   */
  function step_2_through_7() {
    step_2_and_3();
    step_4_and_5();
    //
    var deleted = lines.shift();
    out.write(deleted.line + "\n");
    //
    forPhone(deleted.phones, function (diphone) {
      delete unique[diphone];
    });
    //
    var diphone_count = 0;
    _.each(unique, function (p) {
      diphone_count++;
    });
    console.log(diphone_count, lines.length, " ---------------------");
    if (diphone_count == 0) {
      step_1();
      step_2_and_3();
      step_4_and_5();
      return complete(null, lines);
    }
    step_2_through_7();
  }

  step_1();
  step_2_through_7();

}


///


exports.greedy = greedy;

if (process.argv.length > 3) {
  greedy(process.argv[2], process.argv[3], {}, function () {
    console.log("!");
  })
}