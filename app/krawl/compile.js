var fs = require('fs');
var util = require('util');
var _ = require('lodash');
var mongoose = require('mongoose');
var NLP = require('../phone/stanford/StanfordNLP');
var utils = require('../utils');
var Stream = require('../utils/filestream').Stream;
var crawl = require('../crawl/models');
var stats = require('../phone/stats');
var coreNLP = null;


function initNLP(complete) {
  coreNLP = new NLP({
    nlpPath: "../../corenlp",
    version: "3.4",
    annotators: ['tokenize', 'ssplit', 'pos', 'lemma', 'parse'] // 'ner', 'dcoref'
  }, function (err) {
    if (err) throw err;
    console.log('nlp ready');
    complete(coreNLP);
  });
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
            var count = 0;
            content.find({feed: {$in: fr}}).exec(function (err, content) {
              console.log(c.name, content.length);
              utils.forEach(content, function (doc, next) {
                console.log(count + ' of ' + content.length);
                count++;
                var f = __dirname + '/data/coverage/' + c.name.toLowerCase() + '-' + doc._id + '.json';
                fs.exists(f, function (exists) {
                  if (exists)
                    next();
                  else
                    new Stream(f, function (out) {
                      coreNLP.process(doc.text, function (err, result) {
                        out.writeln(JSON.stringify(result));
                        out.end();
                        next();
                      });
                    });
                });
              }, next);
            });
          });
        }, function () {
          console.log("DONE");
        })
      })
    });
  });
}
