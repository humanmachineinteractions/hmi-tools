var _ = require('lodash');
var mary = require('./mary');
var utils = require('./utils');

var file = process.argv[2];
var lines = [];
var c = 0;
var d = 0;
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
    if (c == d)
      doGreedy();
  });
}, function () {
  console.log("DONE");
});

function doGreedy() {
  console.log("// The greedy selection algorithm (Santen and Buchsbaum, 1997)");
  // This is an optimization technique for constructing a subset of sentences from a large set of sentences
  // to cover the largest unit space with the smallest number of sentences.
  // Algorithm
  // Step 1: Generate a unique biphone list from the corpus.
  var unique_biphones = {};
  _.each(lines, function (line) {
    for (var i = 0; i < line.phones.length - 1; i++) {
      var biphone = line.phones[i] + line.phones[i + 1];
      if (unique_biphones[biphone])
        unique_biphones[biphone].count++;
      else
        unique_biphones[biphone] = { phones: [line.phones[i], line.phones[i + 1]], count: 1};
    }
  });
  // Step 2: Calculate frequency of the biphone in the list from the corpus.
  var total = 0;
  _.each(unique_biphones, function (biphone) {
    total += biphone.count;
  });
  _.each(unique_biphones, function (biphone) {
    biphone.frequency = biphone.count / total;
  });
  // Step 3: Calculate weight of each biphone in the list where weight of a biphone is inverse of the frequency.
  _.each(unique_biphones, function (biphone) {
    biphone.weight = 1 - biphone.frequency;
  });
  //Step 4: Calculate a score for every sentence. The sentence score is defined by the equation (1).
  _.each(lines, function (line) {
    var score = 0;
    for (var i = 0; i < line.phones.length - 1; i++) {
      var biphone = line.phones[i] + line.phones[i + 1];
      score += 1 / (unique_biphones[biphone].frequency);
    }
    line.score = score;
  });
  //
  lines.sort(function (a, b) {
    return  a.score - b.score
  });
  _.each(lines, function (line) {
    console.log(line.score, line.line);
  })

}