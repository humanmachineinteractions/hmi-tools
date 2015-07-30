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


/**
 * This is an optimization technique for constructing a subset of sentences from a large set of sentences
 * to cover the largest unit space with the smallest number of sentences.
 *
 * Algorithm works step−by−step: a first sentence is selected according to a criterion; the sentence is added to the cover,
 * and the covered units are removed from the set of units to cover. The process starts again: the second sentence, in this
 * example, contains a maximum of non−already covered units. The process stops when all units are covered.
 *
 * @param lines {Array} a list of objects {line: "text", transcription: "T EE S"}
 * @param covered {Object} a map of phones to ignore (optional)
 * @param out the output stream
 * @param complete
 */


function doGreedy(lines, unique, covered, out, complete) {


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
   * Step 4: Calculate a score for every sentence. The sentence score is defined by the equation.
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
    step_2_and_3();
    step_4_and_5();
    //
    var selected = lines.shift();
    c++;
    //var ph = translator.translate(selected.transcription, {from: "ARPABET", to: "IPA"}).replace(/_/g, ' ');
    out.write(selected.line + "\t" + selected.transcription + "\n");

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
    if (c > 5000 || phone_count == 0) {
      //step_1();
      //step_2_and_3();
      //step_4_and_5();
      out.end();
      return complete(null, lines);
    }
    process.nextTick(step_2_through_7);
  }

  step_1();
  step_2_through_7();

}


///


exports.greedy = greedy;
exports.doGreedy = doGreedy;


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



