var fs = require('fs');
var _ = require('lodash');
var greedy = require('../phone/greedy').doGreedy;
var stats = require('../phone/stats');
var BP = '/Users/posttool/Documents/github/hmi-www/app/phone/data';

var scriptPaths = [BP + '/ent2.ph', BP + '/long2.ph', BP + '/music2.ph', BP + '/news2.ph', BP + '/sports2.ph', BP + '/tech2.ph'];
stats.composite(scriptPaths, function (err, composite) {
  console.log('Loaded composite ' + composite.length + ' lines');
  var unique = {};
  for (var n = 2; n < 4; n++)
    _.assign(unique, stats.unique(composite, n));
  var lines = [];
  for (var i = 0; i < composite.length; i++) {
    var c = composite[i].split('\t');
    var s = c[0];
    if (s.length > 30 && s.length < 115) {
      var t = c[1];
      lines.push({line: s, transcription: t, phones: t.split(' ')});
    }
  }
  greedy(lines, unique, null, fs.createWriteStream(__dirname + "/data/dv-corpus.ranked.txt"), function () {
    console.log("COMPLETE");
  })
});
