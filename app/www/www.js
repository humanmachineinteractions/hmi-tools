var fs = require('fs');
var logger = require('winston')
var cluster = require('cluster');
var express = require('express');
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



  express()
    .use(express.vhost('hmi.ai', require('./public').app))
    .use(express.vhost('www.hmi.ai', require('./public').app))
    .use(express.vhost('helios.hmi.ai', require('./helios').app))
    .use(express.vhost('humanmachineinteractions.com', require('./public').app))
    .use(express.vhost('www.humanmachineinteractions.com', require('./public').app))
    .use(express.vhost('helios.humanmachineinteractions.com', require('./helios').app))
    .listen(80)
}

//process.on('uncaughtException', function (err) {
//  console.error('uncaughtException:', err.message);
//  console.error(err.stack);
//});

//server.cms/app.on('error', function (err) {
//  console.error(err);
//});

