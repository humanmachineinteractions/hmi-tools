
var FeedParser = require('feedparser');
var request = require('request');
var extractor = require('unfluff');
var url = require('url');
var moment = require('moment');
var _ = require('lodash');
var mongoose = require('mongoose');
var later = require('later');
var ffmpeg = require('fluent-ffmpeg');
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
var Channel = cms.meta.model('Channel');
var Resource = cms.meta.model('Resource');

var _feeds = {}; // mapped by id
var _channels = {};

function check_feeds() {
  console.log('checking...');
  Feed.find({}).exec(function (err, feeds) {
    _feeds = {};
    if (err) {
      console.log(err);
      return;
    }
    _feeds = _.indexBy(feeds, '_id');
    for (var i = 0; i < feeds.length; i++) {
      var feed = feeds[i];
      jobs.create('get_feed', {
        _id: feed._id,
        url: feed.url
      }).save(function (err) {
        if (err) console.log(err);
      });
    }
  });
  // for the fe
  Channel.find({}).exec(function (err, channels) {
    _channels = {};
    if (err) {
      console.log(err);
      return;
    }
    _channels = _.indexBy(channels, '_id');
  });
}

function get_feed_content(_id, url, done) {
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
          feed_id: _id,
          source: meta.title,
          url: item.origlink ? item.origlink : item.link
        }).save(function (err) {
          if (err) console.log(err);
        });
      }
    });
    feedparser.on('error', done);
    feedparser.on('end', done);
  } catch (e) {
    done(e);
  }
}


function save_one(feed_id, source, origlink, complete) {
  request(origlink, function (error, response, body) {
    if (error || response.statusCode != 200)
      return complete(new Error('no go ' + origlink));
    Feed.findOne({_id: feed_id}).exec(function (err, f) {
      if (err) return complete(err);
      var data = extractor.lazy(body, 'en');
      var s = url.parse(origlink);
      Content.findOne({host: s.host, path: s.path}).exec(function (err, c) {
        if (err) return complete(err);
        if (c) return complete();
        var title = data.title();
        var text = data.text();
        if (!title || !text) return complete();
        new Content({
          feed: f,
          host: s.host,
          path: s.path,
          text: text,
          title: title,
          source: source,
          image: data.image(),
          date: new Date()
        }).save(function (err, c) {
            if (err) return complete(err);
            console.log("***ADD", c.title)
            jobs.create('render_tts_wav', { //var job =
              id: c._id, voice: 'Zoe'
            }).save(function (err) {
              if (err) return complete(err);
              return complete();
            });
          })
      });
    });
  });
}


function render_tts_wav(cid, voice, complete) {
  console.log('rendering', cid);
  Content.findOne({_id: cid}).exec(function (err, content) {
    if (err) return complete(err);
    if (!content) return complete(new Error('no content'));
    var text = content.title + ' from ' + content.source + '. ' + content.text;
    var wav_file = voice + '-' + cid + '.wav';
    tts.render(text, cms.config.resourcePath + wav_file, voice, function (err) {
      if (err) return complete(err);
      content.audio = {Zoe: true};
      content.save(function (err, c2) {
        if (err) return complete(err);
        jobs.create('convert_to_mp3', {
          source: wav_file,
          dest: voice + '-' + cid + '.mp3'
        }).save(function (err) {
          if (err) return complete(err);
          return complete();
        });
      });
    });
  });
}

function convert_to_mp3(job, source, dest, done) {
  console.log('converting to mp3', source);
  var dir = cms.config.resourcePath;
  new ffmpeg({source: dir + source})
    .withAudioCodec('libmp3lame') // libmp3lame // libfdk_aac
    .withAudioBitrate('128k') // :-) mp3 196k // 64k
    .withAudioChannels(1) // :-o
    .on('end', function () {
      done();
    })
    .on('error', function (err) {
      console.log('encode error: ' + err.message);
      job.log('encode error: ' + err.message);
      done(err);
    })
    .on('progress', function (progress) {
      job.progress(progress.percent, 100);
    })
    .saveToFile(dir + dest);
}

// ffmpeg info
// The 'progress' event is emitted every time FFmpeg
// reports progress information. 'progress' contains
// the following information:
// - 'frames': the total processed frame count
// - 'currentFps': the framerate at which FFmpeg is currently processing
// - 'currentKbps': the throughput at which FFmpeg is currently processing
// - 'targetSize': the current size of the target file in kilobytes
// - 'timemark': the timestamp of the current frame in seconds
// - 'percent': an estimation of the progress





// KUE

var kue = require('kue')
  , jobs = kue.createQueue();

jobs.process('get_feed', 8, function (job, done) {
  get_feed_content(job.data._id, job.data.url, done);
});

jobs.process('save_content', 8, function (job, done) {
  save_one(job.data.feed_id, job.data.source, job.data.url, done);
});

jobs.process('render_tts_wav', 2, function (job, done) {
  render_tts_wav(job.data.id, job.data.voice, done);
});

jobs.process('convert_to_mp3', 2, function (job, done) {
  convert_to_mp3(job, job.data.source, job.data.dest, done);
});

jobs.on('job complete', function (id, result) {
  kue.Job.get(id, function (err, job) {
    if (err) return;
    job.remove(function (err) {
      if (err) throw err;
     //console.log('removed completed job #%d', job.id);
    });
  });
});

//kue.app.listen(3009);


// EXPRESS

var express = require('express');
var bodyParser = require('body-parser')
var app = express();
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(__dirname + '/public'));

app.get('/content', function (req, res, next) {
  var last = moment().subtract(12, 'hours');
  res.redirect('/content/'+last.format());
});

app.get('/content/:datetime', function (req, res, next) {
  var last = moment(req.params.datetime);
  Content.find({
    date: {$gt: last.toDate()},
    audio: {$ne: null},
    feed: {$ne: null}
  }).sort({date: -1}).limit(20).exec(function (err, contents) {
    if (err) return next(err);
    contents = _.map(contents, function (c) {
      var feed = _feeds[c.feed];
      var channel = feed ? _channels[feed.channel] : null;
      return {
        _id: c._id,
        feed: feed,
        channel: channel,
        url: c.host + c.path,
        source: c.source,
        title: c.title,
        image: c.image,
        date: c.date
      }
    });
    res.json(contents)
  });
});

app.get('/admin/refresh', function (req, res, next) {
    check_feeds();
});

app.get('/audio/:id', function (req, res, next) {
    res.sendfile(cms.config.resourcePath + 'Zoe-' + req.params.id + '.mp3');
});

app.get('/resource/:id', function (req, res, next) {
  Resource.findOne({_id: req.params.id}).exec(function (err, r) {
    if (err) return next(err);
    if (!r) return next(new Error('no such'));
    res.sendfile(cms.config.resourcePath + r.path);
  });
});

app.use(cms.app);
app.listen(cms.config.serverPort);


// LATER

var sched = later.parse.text('every 10 min');
var timer = later.setInterval(check_feeds, sched);


// AND ON STARTUP
check_feeds();


