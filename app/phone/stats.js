var _ = require('lodash');
var ProgressBar = require('progress');
var utils = require('../utils/index');

function unique(lines, n) {
  var unique = {};
  var c = 0;
  var bar = new ProgressBar('Analyzing :current of :total', {total: lines.length});
  lines.forEach(function (line, idx) {
    var s;
    if (typeof(line) == 'string') {
      if (line.indexOf('\t'))
        s = line.split('\t')[1].split(' ');
      else
        s = line.split(' ');
    }
    else {
      s = line.phones;
    }

    forNphone(n, s, function (nph, phones, idx) {
      if (unique[nph])
        unique[nph].count++;
      else
        unique[nph] = {nphone: nph, phones: phones, count: 1, idx: idx, line: line};
    });
    if (idx%100==0)
    bar.tick(100);
    c++;
  });
  return unique;
}

function forNphone(n, phones, cb) {
  var s = phones.length - (n - 1);
  for (var ph_idx = 0; ph_idx < s; ph_idx++) {
    var nphone = '';
    var aphone = [];
    for (var j = 0; j < n; j++) {
      var p = phones[ph_idx + j];
      nphone += p;
      aphone.push(p);
    }
    cb(nphone, aphone, ph_idx, s);
  }
}

function diff(corpus_a, corpus_b, options, complete) {
  var N = options.N ? options.N : 3;
  var intersect = {length: 0};
  utils.readLines(corpus_a, function (err, alines) {
    var a = unique(alines, N);
    utils.readLines(corpus_b, function (err, blines) {
      var b = unique(blines, N);
      for (var an in a) {
        if (b[an]) {
          intersect[an] = {a: a[an], b: b[an]};
          intersect.length++;
          delete a[an];
          delete b[an];
        }
      }
      complete(null, {intersect: intersect, only_in_a: a, only_in_b: b})
    });
  });
}


/**
 * tracks unique keys
 * @constructor
 */
function Mapper() {
  this.map = {};
}
/**
 * add a key to track
 * @param a
 */
Mapper.prototype.add = function (a, b) {
  if (this.map[a])
    this.map[a].use++;
  else
    this.map[a] = {use: 1};
  if (b) {
    if (!this.map[a].b)
      this.map[a].b = new Mapper();
    this.map[a].b.add(b);
  }
}
/**
 * returns an array of names and uses sorted by use
 * @returns {Array}
 */
Mapper.prototype.get = function () {
  var arr = [];
  for (var p in this.map) {
    var o = {name: p, use: this.map[p].use};
    if (this.map[p].b)
      o.b = this.map[p].b;
    arr.push(o)
  }
  arr.sort(function (a, b) {
    return a.use - b.use;
  });
  return arr;
}


exports.Mapper = Mapper;
exports.unique = unique;
exports.forNphone = forNphone;
exports.diff = diff;

if (!module.parent) {
  if (process.argv.length == 4) {
    console.log('!reading ' + process.argv[2])
    utils.readLines(process.argv[2], function (err, lines) {
      console.log('processing ' + lines.length + ' lines');
      var map = unique(lines, process.argv[3]);
      var items = [];
      for (var p in map) {
        items.push(map[p]);
      }
      items.sort(function (a, b) {
        return b.count - a.count
      });
      for (var i = 0; i < 100; i++) {
        console.log(items[i].phones, items[i].count, items[i].position);
        if (i < 3)
          console.log(items[i].line)
      }
      console.log(items.length);
    });
  } else if (process.argv.length == 5) {
    diff(process.argv[2], process.argv[3], {N: Number(process.argv[4])}, function (err, data) {
      console.log(data.intersect.length, _.keys(data.only_in_a).length, _.keys(data.only_in_b).length);
    });
  }
}
