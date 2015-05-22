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
      nlpPath: "../../../corenlp",
      version: "3.4",
      annotators: ['tokenize', 'ssplit', 'pos', 'lemma', 'parse', 'ner', 'dcoref']
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
      nlpify();
    }
  }).on('error', function (err) {
    console.log('error', err)
  }).on('close', function () {
    console.log('complete');
  });

  var ph_stats = {};
  var ner_stats = {};
  var nlpify = function () {
    if (docs.length == 0)
      return;
    console.log("!!!!", docs.length);
    var doc = docs.shift();
    var pp = doc.text.split("\n");
    utils.forEach(pp, function (p, next) {
      if (!p) return next();
      if (useNLP) {
        coreNLP.process(p, function (err, result) {
          console.log('--------------------------------------')
          //console.log(err, result);
          //console.log(util.inspect(result, {depth: 30, colors: true}));
          //console.log(JSON.stringify(result));
          var sentences = result.document.sentences.sentence;
          if (!Array.isArray(sentences)) {
            sentences = [sentences];
          }
          sentences.forEach(function (s) {
            var tokens = s.tokens.token;
            if (!Array.isArray(tokens)) {
              tokens = [tokens];
            }
            tokens.forEach(function (t) {
              var ner = (t.NER != 'O') ? t.NER : '';
              console.log(">", t.word, ner); //t.POS
              if (ner) {
                if (ner_stats[ner]) {
                  ner_stats[ner].c++;
                  if (ner_stats[ner].w[t.word] == null)
                    ner_stats[ner].w[t.word] = 0;
                  else
                    ner_stats[ner].w[t.word]++;
                } else {
                  ner_stats[ner] = {c: 0, w: {}};
                  ner_stats[ner].w[t.word] = 0;
                }
              }
            });
            s.parsedTree.parsedList.forEach(function (p) {
              p.children.forEach(function (c0) {
                c0.children.forEach(function (c1) {
                  console.log("*", c1.type);
                  if (ph_stats[c1.type] != null)
                    ph_stats[c1.type]++;
                  else
                    ph_stats[c1.type] = 0;
                })
              })
            })
          });
          console.log(ph_stats, ner_stats);

          //process.exit(0);
//          if (err || result == null) {
//            console.log("?", err, result);
//            return next();
//          }
//          var sentences = result.document.sentences.sentence;
//          //var corefs = result.document.coreferences.coreference;
//          _.forEach(sentences, function (sentence) {
//            if (sentence.parsedTree && sentence.parsedTree.text != null) {
//              //console.log(c, sentence);
//              //log.write(sentence.parsedTree.text + '\n');
//              c++;
//            }
//          });
          return next();
        });
      } else {
        console.log(pp);
        return next();
      }
    }, function () {
      nlpify();
    });
  };
}

