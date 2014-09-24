var _ = require('lodash');
var mary = require('./mary');
var utils = require('./utils');
var fs = require('fs');
var file = process.argv[2];
var lines = [];
var c = 0;
var d = 0;
var out = fs.createWriteStream(file + "-ranked.txt")

if (fs.existsSync(file + ".json")) {
  fs.readFile(file + ".json", function (err, file) {
    lines = JSON.parse(file);
    doGreedy();
  })
} else {
  utils.readLines(file, function (line) {
    c++;
    var info = {line: line, index: c};
    lines.push(info);
    mary.transcribe(line, function (err, tees) {
      d++;
      info.phones = [];
      _.each(tees, function (t) {
        if (!t.transcription)
          return;
        var phones = t.transcription.split(" ");
        if (phones[0] == '\'')
          phones.shift(); // remove word stress...
        _.each(phones, function (p) {
          info.phones.push(p);
        });
      });
      if (d % 10 == 0)
        console.log('transcribed ' + d + ' of ' + c);
      if (c == d) { // got as many transcriptions as lines...
        fs.writeFile(file + ".json", JSON.stringify(lines), function (err) {
          if (err)  console.log(err);
          doGreedy();
        });
      }
    });
  }, function () {
    console.log("DONE");
  });
}
function forNPhone(n, phones, next) {
  for (var i = 0; i < phones.length - (n - 1); i++) {
    var nphone = '';
    var aphone = [];
    for (var j = 0; j < n; j++) {
      nphone += phones[i + j];
      aphone.push(phones[i + j]);
    }
    next(nphone, aphone);
  }
}

function forBiPhone(phones, next) {
  forNPhone(2, phones, next);
}

function doGreedy() {

  console.log("// The greedy selection algorithm (Santen and Buchsbaum, 1997)");
  // This is an optimization technique for constructing a subset of sentences from a large set of sentences
  // to cover the largest unit space with the smallest number of sentences.
  // Algorithm
  // Step 1: Generate a unique biphone list from the corpus.
  var unique_biphones = {};
  _.each(lines, function (line) {
    forBiPhone(line.phones, function (biphone, phones) {
      if (unique_biphones[biphone])
        unique_biphones[biphone].count++;
      else
        unique_biphones[biphone] = { phones: phones, count: 1};
    });
  });
  function step_2_through_7() {
    // Step 2: Calculate frequency of the biphone in the list from the corpus.
    var total = 0;
    _.each(unique_biphones, function (biphone) {
      total += biphone.count;
    });
    _.each(unique_biphones, function (biphone) {
      biphone.frequency = biphone.count / total;
    });
    // Step 3: Calculate weight of each biphone in the list where weight of a biphone is inverse of the frequency.
    // note - we don't seem to use this!
    _.each(unique_biphones, function (biphone) {
      biphone.weight = 1 - biphone.frequency;
    });
    //Step 4: Calculate a score for every sentence. The sentence score is defined by the equation (1).
    _.each(lines, function (line) {
      var score = 0;
      forBiPhone(line.phones, function (biphone) {
        if (unique_biphones[biphone]) // only biphones we are tracking
          score += 1 / (unique_biphones[biphone].frequency);
      });
      line.score = score;
    });
    // Step 5: Select the highest scored sentence.
    lines.sort(function (a, b) {
      return  b.score - a.score
    });
    // Step 6: Delete the selected sentence from the corpus.
    var deleted = lines.shift();
    console.log(deleted.line, deleted.score);
    out.write(deleted.line+"\n")
    // Step 7: Delete all the biphones found in the selected sentence from the biphone list.
    forBiPhone(deleted.phones, function (biphone) {
      delete unique_biphones[biphone];
    });
    // Step 8: Repeat from Step 2 to 7 until the biphone list is empty.
    var biphone_count = 0;
    _.each(unique_biphones, function (p) {
      biphone_count++;
    });
    console.log(biphone_count, lines.length, " ---------------------");
    if (biphone_count == 0) {
      _.each(lines, function (line) {
        console.log(line.score, line.line);
      });
      return;
    }
    step_2_through_7();
  }

  step_2_through_7();

}

/* more docs

 Algorithm works step−by−step: a first sentence is selected
 according to a criterion; the sentence is added to the cover,
 and the covered units are removed from the set of units to
 cover. The process starts again: the second sentence, in this
 example, contains a maximum of non−already covered
 units. The process stops when all units are covered.

 */