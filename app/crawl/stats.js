var current = require('../../../currentcms');
var utils = require('../../../currentcms/lib/utils');
var reader = {
  config: require('./config'),
  models: require('./models'),
  workflow: null,
  permissions: {}
};
var cms = new current.Cms(reader);
var Content = cms.meta.model('ReaderContent');



var stream = Content.find().stream();
var c = 0;
var m = {};
var T = 50;
stream.on('data', function (doc) {
  console.log(c, doc.title);
  count_words(doc.title);
  count_words(doc.text);
  c++;
}).on('error', function (err) {
  console.error(err);
}).on('close', function () {
  console.log('-----')
  var a = [];
  for (var t in m) {
    if (m[t]>T)
      a.push({token: t, count: m[t]});
  }
  a.sort(function(a,b){
    if(a.count < b.count) return 1;
    if(a.count > b.count) return -1;
    return 0;
  });
  //console.log(a);

  var fs = require('fs');
  var stream = fs.createWriteStream(__dirname + "/stats.csv");
  stream.once('open', function (fd) {

    var c2 = 0;
    utils.forEach(a,
      function (b, next) {
        wordnet.lookup(b.token, function (results) {
          b.wordnet = results;
          var s = '';
          if (results.length == 0)
            s = '-';
          else
            results.forEach(function (r) {
              s += r.pos + "/" + r.lemma + "\t";
            })
          var ss =  b.token + "\t" + b.count + "\t" + s;
          console.log(c2 + "\t" +ss);
          stream.write(ss + "\n");
          c2++;
          next();
        });
      },
      function () {
        stream.end();
      });
  });
});



var natural =  require('natural')
function count_words(s){
  var tokenizer = new natural.WordPunctTokenizer();
  var tokens = tokenizer.tokenize(s);
  tokens.forEach(function(t){
    if (!m[t]) m[t] = 0;
    m[t] ++;
  });
}

  var wordnet = new natural.WordNet('/Users/posttool/Downloads/WordNet-3.0/dict');

