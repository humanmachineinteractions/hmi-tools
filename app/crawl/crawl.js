var Crawler = require("crawler").Crawler;
var MongoClient = require('mongodb').MongoClient;
var _ = require('lodash');
var extractor = require('unfluff');
var config = require('./config');
var utils = require('../utils');

var current = require('../../../currently13/app/modules/cms');
var domain = require('../cms/index');
var cms = new current.Cms(domain);
var Content = cms.meta.model("Content");

Content.remove({}, function (err, ct) {
  console.log('removed',ct)
  var c = new Crawler({
    maxConnections: 5,
    callback: function (error, result, $) {
      // if there is no result, mark page as state = 'crawled_empty'
      var links = $("a"); // need to grab them here, for some reason $ is invalid in callback
      addPage(result, function () {
        links.each(function (index, a) {
          var url = clean(a.href);
          addPageStub(url, function(){});
        });
      });
    },
    onDrain: function(){
//      setTimeout(function () {
        Content.find({state: null}, null, {limit: 2}).exec(function (err, results) {
          console.log('queuing', _.map(results, 'uri'));
          c.queue(_.map(results, 'uri'));
        });
//      }, 500);
    }
  });
  c.queue(["http://nytimes.com", "http://cnn.com"]);
});


function clean(url) {
  var hash_idx = url.indexOf("#");
  if (hash_idx == -1)
    return url;
  else
    return url.substring(0, hash_idx);
}

function addPage(result, complete) {
  var data = extractor(result.body);
  var uri = result.uri; //data.canonicalUri
  console.log(uri)
  Content.findOneAndUpdate({uri: uri}, {
      $set: {
        state: "crawled",
        uri: uri,
        body: data.text,
        title: data.title,
        image: data.image,
        lang: data.lang,
        indexed: new Date()
      }
    }, {upsert: true},
    function (err, p) {
      if (err) return complete(err);
      console.log("saved", p);
      return complete();
    });
}

function addPageStub(uri, complete) {
  Content.findOne({uri: uri}, function (err, page) {
    if (err) throw err;
    if (page) {
      if (complete) return complete();
    } else {
      var c = new Content({
        uri: uri,
      });
      c.save(function (err, p) {
        //console.log('stub', err, p)
        return complete();
      });
    }
  });
}




