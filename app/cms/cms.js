var fs = require('fs');
var logger = require('winston');
var cluster = require('cluster');
var express = require('express');
var mongoose = require('mongoose');
var kue = require('kue');

var current = require('../../../currently13/app/modules/cms');
var useCluster = false;
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
  var server = express();
  var domain = require('./index');

  var cms = new current.Cms(domain);
  server.use(cms.app);

  server.set('views', __dirname + '/views');
  server.use(express.static(__dirname + '/public'));

  var Corpus = cms.meta.model("Corpus");
  var Script = cms.meta.model("Script");
  var Schema = cms.meta.model("Schema");

  server.get('/schema/:seg_id', function(req, res, next){
    Script.find({segments: new mongoose.Types.ObjectId(req.params.seg_id)}).exec(function (err, scripts) {
      if (err) return next(err);
      if (!scripts || scripts.length == 0) return next(new Error('no scripts for seg'));
      Corpus.find({scripts: scripts[0]}).exec(function (err, corpora) {
        if (err) return next(err);
        if (!corpora || corpora.length == 0) return next(new Error('no corpora for seg/script'));
        Schema.findById(corpora[0].scheme).populate('fields').exec(function(err, schema){
          if (err) return next(err);
          res.json(schema);
        })
      });
    });
  });

  server.listen(domain.config.serverPort);

  //
  var jobs = kue.createQueue(cms.kueConfig);
  jobs.on('job complete', function(id,result){
    kue.Job.get(id, function (err, job) {
      if (err) return;
      job.remove(function (err) {
        if (err) throw err;
        console.log('completed job', job, result);
      });
    });
  });


  server.get('/cms/corpus/:id/train_ner', function (req, res, next) {
    jobs.create('train_ner', {
      id: req.params.id
    }).attempts(1).save();
  });

  jobs.process('train_ner', function (job, done) {
    setTimeout(done("something"), 1000);
  });

  kue.app.listen(3004);

}

