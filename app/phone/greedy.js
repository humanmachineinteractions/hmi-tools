var fs = require('fs');
var _ = require('lodash');
var utils = require('../utils');
var PhoneDict = require('./phonedict');

function greedy(infile, outfile, options, complete) {
  var out = fs.createWriteStream(outfile);
  var lines = [];
  var d = new PhoneDict();
  d.on('ready', function () {
    utils.readLines(infile, function (line) {
      var s = d.getTranscriptionInfo(line);
      lines.push({line: line, transcription: s.transcription, phones: s.transcription.split(' ')});
      console.log(lines[lines.length - 1]);
    }, function () {
      doGreedy(lines, out);
    });
  });
}


function doGreedy(lines, out) {
  console.log("// The greedy selection algorithm (Santen and Buchsbaum, 1997)");
  // This is an optimization technique for constructing a subset of sentences from a large set of sentences
  // to cover the largest unit space with the smallest number of sentences.
  var forPhone = forDiphone;
  //var forPhone = forTriphone; // or triphones?
  var unique = {};

  function step_1() {
    // Step 1: Generate a unique diphone list from the corpus.
    _.each(lines, function (line) {
      forPhone(line.phones, function (diphone, phones) {
        if (unique[diphone])
          unique[diphone].count++;
        else
          unique[diphone] = {phones: phones, count: 1};
      });
    });
  }

  function step_2_and_3() {
    // Step 2: Calculate frequency of the diphone in the list from the corpus.
    var total = 0;
    _.each(unique, function (diphone) {
      total += diphone.count;
    });
    _.each(unique, function (diphone) {
      diphone.frequency = diphone.count / total;
    });
    // Step 3: Calculate weight of each diphone in the list where weight of a diphone is inverse of the frequency.
    // note - we don't seem to use this!
    _.each(unique, function (diphone) {
      diphone.weight = 1 - diphone.frequency;
    });
  }

  function step_4_and_5() {
    //Step 4: Calculate a score for every sentence. The sentence score is defined by the equation (1).
    _.each(lines, function (line) {
      var score = 0;
      forPhone(line.phones, function (diphone) {
        if (unique[diphone]) // only diphones we are tracking
          score += 1 / (unique[diphone].frequency);
      });
      line.score = score;
    });
    // Step 5: Select the highest scored sentence.
    lines.sort(function (a, b) {
      return b.score - a.score
    });
  }

  function step_2_through_7() {
    step_2_and_3();
    step_4_and_5();
    // Step 6: Delete the selected sentence from the corpus.
    var deleted = lines.shift();
    out.write(deleted.line + "\t" + deleted.transcription + "\n");
    // Step 7: Delete all the diphones found in the selected sentence from the diphone list.
    forPhone(deleted.phones, function (diphone) {
      delete unique[diphone];
    });
    // Step 8: Repeat from Step 2 to 7 until the diphone list is empty.
    var diphone_count = 0;
    _.each(unique, function (p) {
      diphone_count++;
    });
    console.log(diphone_count, lines.length, " ---------------------");
    if (diphone_count == 0) {
      step_1();
      step_2_and_3();
      step_4_and_5();
      _.each(lines, function (line) {
        out.write(line.line + "\t" + line.transcription + "\n");
        console.log(line.score, line.line);
      });
      return;
    }
    step_2_through_7();
  }

  step_1();
  step_2_through_7();

}


///
function forNphone(n, phones, cb) {
  for (var i = 0; i < phones.length - (n - 1); i++) {
    var nphone = '';
    var aphone = [];
    for (var j = 0; j < n; j++) {
      nphone += phones[i + j];
      aphone.push(phones[i + j]);
    }
    cb(nphone, aphone);
  }
}

function forDiphone(phones, cb) {
  forNphone(2, phones, cb);
}

function forTriphone(phones, cb) {
  forNphone(3, phones, cb);
}


/*

 Algorithm works step−by−step: a first sentence is selected
 according to a criterion; the sentence is added to the cover,
 and the covered units are removed from the set of units to
 cover. The process starts again: the second sentence, in this
 example, contains a maximum of non−already covered
 units. The process stops when all units are covered.

 */

exports.greedy = greedy;

if (process.argv.length > 3) {
  greedy(process.argv[2], process.argv[3], {}, function () {
    console.log("!");
  })
}