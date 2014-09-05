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
  var server = express();
  server.set('views', __dirname + '/views');
  server.use(express.static(__dirname + '/public'));
  server.get('/', function(req, res, next){
    res.render('index.ejs');
  });

  server.listen(3002);
}

//process.on('uncaughtException', function (err) {
//  console.error('uncaughtException:', err.message);
//  console.error(err.stack);
//});

//server.cms/app.on('error', function (err) {
//  console.error(err);
//});

