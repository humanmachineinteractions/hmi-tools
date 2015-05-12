var utils = require('../utils/index');

function unique(lines, n) {
  var unique = {};
  lines.forEach(function (line) {
    forNphone(n, line.split(' '), function (nph, phones) {
      if (unique[nph])
        unique[nph].count++;
      else
        unique[nph] = {phones: phones, count: 1};
    });
  });
  return unique;
}

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


exports.unique = unique;

if (process.argv.length > 3) {
  utils.readLines(process.argv[2], function (err, lines) {
    console.log('processing '+lines.length+' lines');
    var map = unique(lines, process.argv[3]);
    var items = [];
    for (var p in map) {
      items.push(map[p]);
    }
    items.sort(function (a, b) {
      return b.count - a.count
    });
    console.log(items);
    console.log(items.length);
  })
}