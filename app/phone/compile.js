var fs = require('fs');
var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;
var utils = require('../utils');
var NLP = require('./stanford/StanfordNLP');
var db = null;
var coreNLP = null;
var m = {};
MongoClient.connect("mongodb://192.155.87.239/hmi", function (err, d) {
  if (err) throw err;
  console.log('db ready');
  db = d;
  coreNLP = new NLP({
    nlpPath: "../../corenlp",
    version: "3.4",
    //annotators: ['tokenize', 'ssplit', 'pos', 'lemma', 'parse'] //, 'ner', 'dcoref'
  }, function (err) {
    if (err) throw err;
    console.log('nlp ready');
    collect_and_write();
  });
});


function collect_and_write() {
  var c = 0;
  var log = fs.createWriteStream(__dirname + '/log4.txt');
// use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file

  var content = db.collection('readercontents');
  var cursor = content.find({host:'medium.com'});
  var process = function (err, doc) {
    console.log(err,doc)
    if (err || doc == null) {
      log.end();
      return;
    }
    var pp = doc.text.split("\n");
    utils.forEach(pp, function (p, next) {
      if (!p) return next();
      coreNLP.process(p, function (err, result) {
        console.log(err, result);
        //console.log(util.inspect(result, { depth: 5, colors: true }));
        if (err || result == null) {
          console.log("?", err, result);
          return next();
        }
        var sentences = result.document.sentences.sentence;
        //var corefs = result.document.coreferences.coreference;
        _.forEach(sentences, function (sentence) {
          if (sentence.parsedTree && sentence.parsedTree.text != null) {
            console.log(c, sentence.parsedTree.text);
            log.write(sentence.parsedTree.text + '\n');
            c++;
          }
        });
        return next();
      });
    }, function () {
      cursor.nextObject(process);
    });
  };
  cursor.nextObject(process);
}

