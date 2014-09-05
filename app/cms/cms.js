var fs = require('fs');
var logger = require('winston');
var cluster = require('cluster');
var express = require('express');
var mongoose = require('mongoose');
//var bugsnag = require("bugsnag");
//bugsnag.register("5c77895342af431a53b6070d90ea6280");
////bugsnag.notify(new Error("Non-fatal"));

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
}

