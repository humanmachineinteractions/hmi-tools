var fs = require('fs');
var logger = require('winston');
var cluster = require('cluster');
var express = require('express');
var mongoose = require('mongoose');
var kue = require('kue');
var spawn = require('child_process').spawn;
var http = require('http');

var current = require('../../../currentcms');
var utils = require('../../../currentcms/lib/utils');
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
  var app = express();

  var domain = {
    config: require('./config'),
    models: require('./models'),
    workflow: require('./workflow'),
    permissions: require('./permission')
  };
  var cms = new current.Cms(domain);
  app.use(cms.app);

  var jobs = kue.createQueue(cms.kueConfigH);

  var PhoneDict = require('../phone/phonedict');
  var phoneDict = new PhoneDict({phonesaurus: false});
  phoneDict.on('ready', function () {
    console.log('phonedict ready')
  });

  app.set('views', __dirname + '/views');
  app.use(express.static(__dirname + '/public'));

  var Product = cms.meta.model("Product");
  var Domain = cms.meta.model("Domain");
  var Script = cms.meta.model("Script");
  var Schema = cms.meta.model("Schema");
  var Utterance = cms.meta.model("Utterance");
  var Work = cms.meta.model("Work");
  var Resource = cms.meta.model("Resource");

  // wrap up job
  jobs.on('job complete', function(id,result){
    kue.Job.get(id, function (err, job) {
      if (err) return;
      Work.findOne({jobId: job.id}).exec(function(err, w){
        if (err) return;
        w.complete = true;
        w.save(function(){
          job.remove(function (err) {
            if (err) throw err;
            console.log('completed job', job.id, result);
          });
        });
      })
    });
  });


  function new_work(job, done) {
    new Work({
      refType: job.data.refType,
      refId: job.data.refId,
      jobId: job.id,
      type: job.name,
      kwargs: job.data.kwargs,
      userId: job.userId,
      created: new Date(),
      complete: false}).save(done);
  }

  function find_work(type, id, complete, done) {
    Work.find({refType: type, refId: id, complete: complete}).exec(done)
  }

  function createOrFind(T, q, done) {
    T.findOne(q).exec(function(err, t){
      if (!t) {
        new T(q).save(function(err, t){
          done(err, t);
        })
      } else {
        done(err, t);
      }
    });
  }
  // compute a script
  var computeScript = require('../phone/greedy');
  var XLSX = require('xlsx');
  var corpus = require('../corpus')
  var D = require('../corpus/dynamic');
  var getWorkLog = function(work) {
    return function(msg){
      work.logs.push({message: msg, timestamp: new Date()});
      work.save(function(err, w){
        console.log('save work',err)
      });
      // socket.emit('work-log', {id: work._id, message: msg});
    }
  }
  jobs.process('generate-domain-script', function (job, done) {
    job.name = 'generate-domain-script';
    new_work(job, function(err, work) {
      var workLog = getWorkLog(work);

      // TODO return a cancelable worker
      // var worker =
      computeScript.ranked(Utterance, job, workLog, function (err, results) {
        console.log("domain script complete", results.length);
        Product.findOne({_id: job.data.refId}).exec(function(err, p){
          var s = new Script({name: "generated script"});
          results.forEach(function(l){
            s.utterances.push(l.id);
          });
          s.save(function(err, s1){
            p.scripts.push(s);
            p.save(function(err,p1){
                work.complete = true;
                work.save(function(err, w1){
                  done();
                });
            });
          });
        })
      });
    });
  });

  function getWorksheetsAndDomains(job, it, complete) {
    Resource.find({_id: {$in: job.data.kwargs.templates}}).exec(function(err, templates){
      utils.forEach(templates, function(t, next){
        var workbook = XLSX.readFile(domain.config.fileConfig.basePath + '/' + t.path);
        utils.forEach(workbook.SheetNames, function(sheet, next){
          var title = sheet;
          var sidx = sheet.indexOf('-');
          if (sidx != -1) {
            title = title.substring(sidx+1).trim()
          }
          title = title.toLowerCase();
          createOrFind(Domain, {name: title}, function(err, domain){
            var worksheet = workbook.Sheets[sheet];
            console.log(title, domain.name)
            it(worksheet, domain, next)
          });
        }, function(){
          console.log('sheets complete');
          next();
        });
      }, function(){
        console.log('templates complete');
        complete();
      });
    });
  }

  function expandWorksheet(worksheet, domainName) {
    var expanded = [];
    for (z in worksheet) {
      if (z.indexOf("C") == 0 && z != "C1") {
        var r = corpus.processRow(D[domainName], worksheet[z].v);
        r.forEach(function (s) {
          expanded.push(s);
        });
      }
    }
    return expanded;
  }

  jobs.process('generate-templated-script', function (job, done) {
    job.name = 'generate-templated-script';
    new_work(job, function(err, work) {
      var workLog = getWorkLog(work);
      var scripts = [];
      getWorksheetsAndDomains(job, function(worksheet, domain, next){
        var expanded = expandWorksheet(worksheet, domain.name);
        workLog('Ranking '+expanded.length+' lines for '+domain.name+'.');
        computeScript.ranked2(Utterance, expanded, Number(job.data.kwargs.total), workLog, function (err, ranked) {
          var script = new Script({name: "generated "+domain.name});
          utils.forEach(ranked, function(o, next){
            createOrFind(Utterance, {orthography: o.line, transcription: o.transcription, domain: domain}, function(err, utt){
              console.log(utt);
              script.utterances.push(utt);
              next();
            });
          }, function(){
            script.save(function(err, script){
              scripts.push(script);
              next();
            })
          })
        })
      }, function(){
        Product.findOne({_id: job.data.refId}).exec(function(err, p){
          scripts.forEach(function(s){
            p.scripts.push(s);
          });
          p.save(function(err,p1){
              work.complete = true;
              work.save(function(err, w1){
                done();
              });
          });
        })
      })
    })
  });


   app.post('/cms/work', function(req, res, next){
     find_work(req.body.type, req.body.id, false, function(err, w){
       res.json(w);
     });
   });

   app.post('/cms/work/:id/abort', function(req, res, next){
     Work.findOne({_id:req.params.id}).exec(function(err, w){
       if (err) return next(err);
       //worker.terminate();
       w.remove(function(err, i){
         if (err) return next(err);
         res.json(i);
       })
     })
   });

  app.post('/cms/product/:id/generate-templated-script', function (req, res, next) {
    jobs.create('generate-templated-script', {
      refType: 'Product',
      refId: req.params.id,
      userId: req.session.user._id,
      kwargs: {
        total: req.body.total,
        templates: req.body.templates
      }
    }).attempts(1).save(function(){
      res.json("Working...");
    });
  });

  app.post('/cms/product/:id/generate-domain-script', function (req, res, next) {
    jobs.create('generate-domain-script', {
      refType: 'Product',
      refId: req.params.id,
      userId: req.session.user._id,
      kwargs: {
        total: req.body.total,
        domains: req.body.domains,
        sentenceLength: req.body.sentenceLength
      }
    }).attempts(1).save(function(){
      res.json("Working...");
    });
  });

  // global add transcript

  var addingTranscript = false;
  app.get('/cms/utterances/add-transcription', function(req, res, next){
    if (addingTranscript) {
      return next(new Error('in progress'));
    }
    addingTranscript = true;
    var stream = Utterance.find({transcription: null}).stream();
    var c = 0;
    stream.on('data', function (doc) {
      phoneDict.getTranscriptionInfo(doc.orthography, function (err, s) {
        // console.log(s);
        doc.transcription = s.transcription.join('  ');
        doc.save(function(x,a){
          c++;
          if (c%1000==0)
            console.log('transcribed', c, doc);
        })

      });
    }).on('error', function (err) {
      console.log("ERRROR add trans", err)
    }).on('close', function () {
      addingTranscript = false;
      console.log("complete")
    });

    res.json('working');

  });


// start servin'


  var server = app.listen(domain.config.serverPort);
  // var io = require('socket.io').listen(server);
  //
  // var sockets = {};
  // var socketIdToUserId = {};
  // io.on('connection', function (socket) {
  //   socket.on('disconnect', function () {
  //     delete sockets[socketIdToUserId[socket.id]];
  //   });
  //   socket.on('user', function (data) {
  //     socketIdToUserId[socket.id] = data;
  //     sockets[data] = socket;
  //   });
  //   socket.on('get-work', function (data) {
  //     find_work(data.type, data.id, false, function(err, w){
  //       socket.emit('work', w);
  //     })
  //   });
  // });


  kue.app.listen(3004);


}
