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

  server.listen(domain.config.serverPort);
}

