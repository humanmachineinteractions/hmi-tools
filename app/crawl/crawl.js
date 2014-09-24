var cluster = require("cluster");
var useCluster = true;
var _ = require('lodash');
var extractor = require('unfluff');
var url = require('url');
var config = require('./config');
var utils = require('../utils');




var Content;

if (useCluster && cluster.isMaster) {
  var cpuCount = require('os').cpus().length;
  for (var i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }
  cluster.on('exit', function (worker) {
    console.log('Worker ' + worker.id + ' died');
    cluster.fork();
  });
} else {
  var current = require('../../../currently13/app/modules/cms');
  var domain = require('../cms/index');
  var cms = new current.Cms(domain);
  Content = cms.meta.model("Content");
  console.log('worker init')
  crawl();
}


var request = require('request');
var jsdom = require('jsdom');


function crawl() {
  var current_content = null;

  function do_request(complete) {
    console.log('http://' + current_content.host +  current_content.path)
    jsdom.env({
      url: 'http://'+ current_content.host + current_content.path,
      //scripts: ["http://code.jquery.com/jquery.js"],
      done: function (errors, window) {
        if (errors) {
          console.log("ERRRRR", errors, current_content);
          Content.findOneAndUpdate({host: current_content.host, path: current_content.path }, {
              $set: {
                state: "crawled_error",
                body: errors[0].message
              }
            }, {upsert: true},
            function (err, p) {
              if (err) console.log("crawl db err", err);
              else console.log("saved w/ err", p);
              complete();
            });
        }
        else {
          addPage(current_content.host, current_content.path, window.document.title,  window.document.body.innerHTML, function () {
            utils.forEach(window.document.getElementsByTagName('A'), function (a, next) {
              addPageStub(a.getAttribute("href"), next)
            }, function () {
              complete();
            });
          });
        }
      }
    });

  }

  function queue_one() {
    setTimeout(function() {
      Content.find({state: "init"}).exec(function (err, results) {
        if (err || results == null || results.length == 0) {
          setTimeout(function () {
            console.log(' ... retry')
            queue_one();
          }, 2000);
          return;
        }
        current_content = results[Math.floor(Math.random()*results.length)];
        do_request(function(){
          queue_one();
        });
      });
    }, 100);
  }

  queue_one();
}

function clean(urlStr) {
//  var hash_idx = url.indexOf("#");
//  if (hash_idx == -1)
//    return url;
//  else
//    return url.substring(0, hash_idx);
  var s = url.parse(urlStr);
  return {host: s.host, path: s.path};
}

function addPage(host, path, title, body, complete) {
  var data = extractor.lazy(body, 'en');
  Content.findOneAndUpdate({host: host, path: path},
    {
      state: "crawled",
      host: host,
      path: path,
      body: data.text(),
      title: title,
      image: data.image(),
      lang: data.lang(),
      indexed: new Date(),
      $inc: {
        hits: 1
      }
    }, {upsert: true},
    function (err, p) {
      if (err) return complete(err);
   console.log("ADD", p)
     return complete();
    });
}

var nofollowpaths = ['login','register','auth', 'adx/bin'];
function addPageStub(url, complete) {
  if (url == null || url.indexOf("http") != 0)
    return complete();
  url = clean(url);
  for (var i = 0; i < nofollowpaths.length; i++) {
    if (url.path.indexOf(nofollowpaths[i]) != -1)
      return complete();
  }
  Content.findOne({host: url.host, path: url.path}, function (err, page) {
    if (err) throw err;
    if (page) {
      return complete();
    } else {
      var c = new Content({
        host: url.host,
        path: url.path,
        state: "init"
      });
      c.save(function (err, p) {
        //console.log('stub', err, p)
        return complete();
      });
    }
  });
}




