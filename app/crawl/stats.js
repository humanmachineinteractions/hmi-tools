var fs = require('fs');
var natural = require('natural');
var wordnet = new natural.WordNet('/Users/posttool/Downloads/WordNet-3.0/dict');
var mary = require('../phone/mary');

var current = require('../../../currentcms');
var utils = require('../../../currentcms/lib/utils');
var cms = new current.Cms({
  config: require('./config'),
  models: require('./models'),
  workflow: null,
  permissions: {}
});
var Content = cms.meta.model('ReaderContent');

var metaphone = natural.Metaphone, soundEx = natural.SoundEx;
metaphone.attach();
var stream = Content.find().stream();
var c = 0;
var m = {};
var n = {};
var T = 50;

stream.on('data', function (doc) {
  var self = this
  console.log(c, doc.title);
  //count_words(doc.title);
  //count_words(doc.text);
  //count_ngrams(doc.title, 4);
  //count_ngrams(doc.text, 4);
  //var s = metaphone.process(doc.title);
  self.pause();
  mary.transcribe(doc.title, function (err, s) {
    console.log(">", err, s);
    self.resume();
  });
  c++;
}).on('error', function (err) {
  console.error(err);
}).on('close', function () {
  //var a = [];
  //for (var p in n)
  //  a.push(n[p]);
  //a.sort(function (a, b) {
  //  if (a.count < b.count) return 1;
  //  if (a.count > b.count) return -1;
  //  return 0;
  //});
  //write_array('stats3.csv', a, function (b) {
  //  return b.token + "\t" + b.count;
  //}, function () {
  //  process.exit(0);
  //})
});


function count_words(s) {
  var tokenizer = new natural.WordPunctTokenizer();
  var tokens = tokenizer.tokenize(s);
  tokens.forEach(function (t) {
    if (!m[t]) m[t] = {token: t, count: 0};
    m[t].count++;
  });
}


function count_ngrams(s, c) {
  var ngrams = natural.NGrams.ngrams(s, c);
  ngrams.forEach(function (t) {
    var g = t.join(' ');
    if (!n[g]) n[g] = {token: g, count: 0};
    n[g].count++;
  });
}

function lookup(b, next) {
  wordnet.lookup(b.token, function (results) {
    b.wordnet = results;
    var s = '';
    if (results.length == 0)
      s = '-';
    else
      results.forEach(function (r) {
        s += r.pos + "/" + r.lemma + "\t";
      });
    var ss = b.token + "\t" + b.count + "\t" + s;
    next(ss);
  });
}

function write_array(fname, a, sf, complete) {
  var max = 2000, c = 0;
  var stream = fs.createWriteStream(__dirname + "/" + fname);
  stream.once('open', function () {
    utils.forEach(a,
      function (b, next) {
        var s = sf(b);
        console.log(s);
        stream.write(s + "\n", function () {
          c++;
          if (c < max)
            next();
          else {
            stream.end();
            complete();
          }
        });
      },
      function () {
        stream.end();
        complete();
      });
  });
}
