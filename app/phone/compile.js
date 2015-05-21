var fs = require('fs');
var util = require('util');
var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;
var utils = require('../utils');
var NLP = require('./stanford/StanfordNLP');
var db = null;
var coreNLP = null;
var useNLP = true;


MongoClient.connect("mongodb://192.155.87.239/hmi", function (err, d) {
  if (err) throw err;
  console.log('db ready');
  db = d;
  if (useNLP) {
    coreNLP = new NLP({
      nlpPath: "../../corenlp",
      version: "3.4",
      annotators: ['tokenize', 'ssplit', 'pos', 'lemma', 'parse'] //, 'ner', 'dcoref'
    }, function (err) {
      if (err) throw err;
      console.log('nlp ready');
      collect_and_write();
    });
  } else
    collect_and_write();
});


function collect_and_write() {
  var c = 0;
  var log = fs.createWriteStream(__dirname + '/log7.txt');

  var content = db.collection('readercontents');
  var stream = content.find().stream();

  var docs = [];
  var start = false;
  stream.on('data', function (doc) {
    docs.push(doc);
    if (!start) {
      start = true;
      process();
    }
  }).on('error', function (err) {
    console.log('error', err)
  }).on('close', function () {
    console.log('complete');
  });

  var process = function () {
    if (docs.length == 0)
      return;
    var doc = docs.shift();
    var pp = doc.text.split("\n");
    utils.forEach(pp, function (p, next) {
      if (!p) return next();
      if (useNLP) {
        coreNLP.process(p, function (err, result) {
          console.log('--------------------------------------')
          //console.log(err, result);
          console.log(util.inspect(result, {depth: 30, colors: true}));
          if (err || result == null) {
            console.log("?", err, result);
            return next();
          }
          var sentences = result.document.sentences.sentence;
          //var corefs = result.document.coreferences.coreference;
          _.forEach(sentences, function (sentence) {
            if (sentence.parsedTree && sentence.parsedTree.text != null) {
              //console.log(c, sentence);
              //log.write(sentence.parsedTree.text + '\n');
              c++;
            }
          });
          return next();
        });
      } else {
        console.log(pp);
        return next();
      }
    }, function () {
      process();
    });
  };
}

