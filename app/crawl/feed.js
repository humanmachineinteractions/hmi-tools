
var FeedParser = require('feedparser');
var request = require('request');
var extractor = require('unfluff');
var url = require('url');
var moment = require('moment');
var uuid = require('uuid');
var mongoose = require('mongoose');
var later = require('later');
var tts = require('../ndev/tts');
var current = require('../../../currentcms');
var reader = {
  config: require('./config'),
  models: require('./models'),
  workflow: null,
  permissions: {}
};
var cms = new current.Cms(reader);
var Content = cms.meta.model('ReaderContent');
var Feed = cms.meta.model('ReaderFeed');

function check_feeds() {
  console.log('checking...')
  Feed.find({}).exec(function (err, feeds) {
    if (err) {
      console.log(err);
      return;
    }
    for (var i = 0; i < feeds.length; i++) {
      jobs.create('get_feed', {
        url: feeds[i].url
      }).save(function (err) {
        if (err) {
          console.log(err);
          return;
        }
      });
    }
  });
}

function get_feed_content(url, done) {
  console.log("get_feed_content ", url);
  var feedparser = new FeedParser();
  try {
    var req = request(url);
    req.on('error', done);
    req.on('response', function (res) {
      var stream = this;
      if (res.statusCode != 200)
        return this.emit('error', new Error('Bad status code'));
      stream.pipe(feedparser);
    });

    feedparser.on('readable', function () {
      var stream = this, meta = this.meta, item;
      while (item = stream.read()) {
        jobs.create('save_content', {
          source: meta.title,
          url: item.origlink ? item.origlink : item.link
        }).save(function (err) {
        });
      }
    });
    feedparser.on('error', done);
    feedparser.on('end', done);
  } catch (e) {
    done(e);
  }
}


function save_one(source, origlink, complete) {
  request(origlink, function (error, response, body) {
    if (error || response.statusCode != 200)
      return complete(new Error('no go'));
    var data = extractor.lazy(body, 'en');
    var s = url.parse(origlink);
    Content.findOne({host: s.host, path: s.path}).exec(function (err, c) {
      if (err) return complete(err);
      if (c) return complete();
      new Content({
        host: s.host,
        path: s.path,
        text: data.text(),
        title: data.title(),
        source: source,
        image: data.image(),
        date: new Date()
      }).save(function (err, c) {
          if (err) return complete(err);
          console.log("***ADD", c.title)
          var job = jobs.create('render_audio', {
            id: c._id
          }).save(function (err) {
            if (err) return complete(err);
            return complete();
          });
        })
    });
  });
}


function render(cid, complete) {
  console.log('rendering', cid);
  Content.findOne({_id: cid}).exec(function (err, content) {
    if (err) return complete(err);
    if (!content) return complete(new Error('no content'));
    var text = content.title + ' from ' + content.source + '. ' + content.text;
    var file = 'Zoe-' + cid + '.wav';
    tts.render(text, cms.config.resourcePath + file, 'Zoe', function () {
      content.audio = {Zoe: file};
      content.save(function (err, c2) {
        if (err) return complete(err);
        return complete();
      });
    });
  });
}


// KUE

var kue = require('kue')
  , jobs = kue.createQueue();

jobs.process('get_feed', 6, function (job, done) {
  get_feed_content(job.data.url, done);
});

jobs.process('save_content', function (job, done) {
  save_one(job.data.source, job.data.url, done);
});

jobs.process('render_audio', 2, function (job, done) {
  render(job.data.id, done);
});

kue.app.listen(3009);


// EXPRESS

var express = require('express');
var bodyParser = require('body-parser')
var app = express();
app.use(bodyParser.urlencoded({extended: false}))
// app.use(express.static(__dirname + '/public'));

app.get('/content', function (req, res, next) {
  var last = moment().subtract(12, 'hours');
  Content.find({date: {$gt: last.toDate()}}, null, {sort: {date: -1}}).exec(function (err, c) {
    if (err) return next(err);
    res.json(c)
  });
});
//app.get('/s', function (req, res, next) {
//  check_feeds();
//});
app.get('/audio/:id', function (req, res, next) {
    res.sendfile(cms.config.resourcePath + 'Zoe-' + req.params.id + '.wav');
})

app.use(cms.app);

app.listen(cms.config.serverPort);


// LATER

var sched = later.parse.text('every 10 min');
var timer = later.setInterval(check_feeds, sched);



