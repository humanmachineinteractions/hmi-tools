var _ = require('lodash');
var extractor = require('unfluff');
var url = require('url');
var config = require('./config');
var utils = require('../utils');
var current = require('../../../currently13/app/modules/cms');
var domain = require('../cms/index');
var cms = new current.Cms(domain);
var Content = cms.meta.model("Content");

Content.remove({}, function (err, ct) {
  console.log('removed',ct);
  addPageStub('http://www.nytimes.com/', function(err, c){
    crawl();
  });
});

//var cluster = require("cluster");
//var useCluster = true;
//function start_crawler(){
//  if (useCluster && cluster.isMaster) {
//  var cpuCount = require('os').cpus().length;
//  for (var i = 0; i < cpuCount; i += 1) {
//    cluster.fork();
//  }
//  cluster.on('exit', function (worker) {
//    console.log('Worker ' + worker.id + ' died');
//    cluster.fork();
//  });
//} else {
//  }
//}

var request = require('request');
var jsdom = require('jsdom');


function crawl() {
  var current_content = null;

  function do_request() {
    console.log(current_content.url)
    jsdom.env({
      url: current_content.url,
      //scripts: ["http://code.jquery.com/jquery.js"],
      done: function (errors, window) {
        if (errors) {
          console.log("ERRRRR", errors, current_content);
          Content.findOneAndUpdate({url: current_content.url}, {
              $set: {
                state: "crawled_error",
                body: errors[0].message
              }
            }, {upsert: true},
            function (err, p) {
              if (err) console.log("crawl db err", err);
              else console.log("saved w/ err", p);
              queue_one();
            });
        }
        else {
          addPage(current_content.url, window.document.body.outerHTML, function () {
            utils.forEach(window.document.getElementsByTagName('A'), function (a, next) {
              addPageStub(a.getAttribute("href"), next)
            }, function () {
              queue_one();
            });
          });
        }
      }
    });

  }

  function queue_one() {
    setTimeout(function() {
      Content.findOne({state: "init"}).exec(function (err, content) {
        current_content = content;
        do_request();
      });
    }, 100);
  }

  queue_one();
}

function clean(url) {
  var hash_idx = url.indexOf("#");
  if (hash_idx == -1)
    return url;
  else
    return url.substring(0, hash_idx);
//  var s = url.parse(urlStr);
//  console.log(s);
//  return s.protocoll
}

function addPage(url, body, complete) {
  console.log("ADD", url)
  var data = extractor(body);
//  var data = {text:body,title:'',image:'',lang:''};
  url = clean(url); //data.canonicalUri
  Content.findOneAndUpdate({url: url},
    {
      state: "crawled",
      url: url,
      body: data.text,
      title: data.title,
      image: data.image,
      lang: data.lang,
      indexed: new Date(),
      $inc: {
        hits: 1
      }
    }, {upsert: true},
    function (err, p) {
      if (err) return complete(err);
      return complete();
    });
}

var nofollowpaths = ['login','register','auth', 'adx/bin'];
function addPageStub(url, complete) {
  if (url == null || url.indexOf("http") != 0)
    return complete();
  url = clean(url);
  for (var i = 0; i < nofollowpaths.length; i++) {
    if (url.indexOf(nofollowpaths[i]) != -1)
      return complete();
  }
  Content.findOne({url: url}, function (err, page) {
    if (err) throw err;
    if (page) {
      return complete();
    } else {
      var c = new Content({
        url: url,
        state: "init"
      });
      c.save(function (err, p) {
        console.log('stub', err, p)
        return complete();
      });
    }
  });
}




