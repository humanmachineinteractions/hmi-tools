var fs = require('fs');
var util = require('util');
var _ = require('lodash');
var mongoose = require('mongoose');
var utils = require('../utils/index');
var crawl = require('../crawl/models');
var NLP = require('../phone/stanford/StanfordNLP');
var stats = require('../phone/stats');
var Stream = require('./filestream').Stream;
var coreNLP = null;


function initNLP(complete) {
  coreNLP = new NLP({
    nlpPath: "../../corenlp",
    version: "3.4",
    annotators: ['tokenize', 'ssplit', 'pos', 'lemma', 'parse', 'ner', 'dcoref']
  }, function (err) {
    if (err) throw err;
    console.log('nlp ready');
    complete(coreNLP);
  });
}

function arrayify(a) {
  if (Array.isArray(a)) {
    return a;
  } else {
    return [a];
  }
}

get_data();

function get_data() {
  mongoose.connect("mongodb://192.155.87.239/hmi", function (err, db) {
    if (err) throw err;
    console.log('db ready');
    initNLP(function () {
      var channels = mongoose.model('channels', crawl.Channel.schema);
      var feeds = mongoose.model('readerfeeds', crawl.ReaderFeed.schema);
      var content = mongoose.model('readercontents', crawl.ReaderContent.schema);
      channels.find({}).exec(function (err, cr) {
        utils.forEach(cr, function (c, next) {
          feeds.find({channel: c}).exec(function (err, fr) {
            content.find({feed: {$in: fr}}).exec(function (err, content) {
              console.log(c.name, content.length);
              new Stream(__dirname + '/data/gen-' + c.name.toLowerCase() + '.txt', function (out) {
                write_nlp_info(content, out, next);
              })
            })
          });
        }, function () {
          console.log("DONE");
        })
      })
    });
  });
}

function write_nlp_info(docs, log, complete) {
  var c = 0;

  var ph_stats = new stats.Mapper();
  var ner_stats = new stats.Mapper();
  utils.forEach(docs, function (doc, next) {
    var pp = doc.text.split("\n");
    utils.forEach(pp, function (p, next) {
      if (!p) return next();
      coreNLP.process(p, function (err, result) {
        console.log('--------------------------------------')
        //console.log(err, result);
        //console.log(util.inspect(result, {depth: 30, colors: true}));
        //console.log(JSON.stringify(result));
        var sentences = arrayify(result.document.sentences.sentence);
        sentences.forEach(function (s) {
          if (s.parsedTree && s.parsedTree.text != null) {
            log.writeln(s.parsedTree.text);
            c++;
          }
          var tokens = arrayify(s.tokens.token);
          tokens.forEach(function (t) {
            var ner = (t.NER != 'O') ? t.NER : '';
            console.log(">", t.word, ner); //t.POS
            if (ner) {
              ner_stats.add(ner, t.word);
            }
          });
          s.parsedTree.parsedList.forEach(function (p) {
            p.children.forEach(function (c0) {
              c0.children.forEach(function (c1) {
                console.log("*", c1.type);
                ph_stats.add(c1.type);
              });
            });
          })
        });


//          var sentences = result.document.sentences.sentence;
//          //var corefs = result.document.coreferences.coreference;
//          _.forEach(sentences, function (sentence) {
//            if (sentence.parsedTree && sentence.parsedTree.text != null) {
//              //console.log(c, sentence);
//              //log.write(sentence.parsedTree.text + '\n');
//              c++;
//            }
//          });
        next();
      });

    }, next)
  }, function () {
    log.end();
    console.log(c + ' lines processed');
    console.log(ph_stats.get());
    console.log(ner_stats.get());
    complete();
  })
}

