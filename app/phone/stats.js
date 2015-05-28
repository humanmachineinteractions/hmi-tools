var utils = require('../utils/index');

function unique(lines, n) {
  var unique = {};
  lines.forEach(function (line) {
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
    for (var i = 0; i < s.length; i++) {
      if (s[i].length > 2) {
        //console.log('invalid symbol '+s[i]);
        return;
      }
    }
    forNphone(n, s, function (nph, phones, idx) {
      var p = Math.floor((idx / s.length) * 4);
      if (unique[nph + p])
        unique[nph + p].count++;
      else
        unique[nph + p] = {phones: phones, count: 1, position: p, idx: idx, line: line};
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
    cb(nphone, aphone, i);
  }
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
    arr.push({name: p, use: this.map[p].use, b: this.map[p].b})
  }
  arr.sort(function (a, b) {
    return b.use - b.use;
  });
  return arr;
}


exports.Mapper = Mapper;
exports.unique = unique;
exports.forNphone = forNphone;

if (process.argv.length > 3) {
  console.log('reading ' + process.argv[2])
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
    for (var i=0; i<100; i++) {
      console.log(items[i].phones, items[i].count, items[i].position);
    }
    console.log(items.length);
  })
}
