var express = require('express');
var http = require('http');
var app = express();
exports.app = app;
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res, next){
  res.render('helios.ejs');
});
app.get('/test/:text', function (req, res, next) {
  var options = {
    host: 'localhost',
    port: 8080,
    path: '/cms?id=540a3966d076000b2a988412&text='+encodeURIComponent(req.params.text)
  };
  http.get(options, function (hres) {
    hres.on("data", function (chunk) {
      res.json(JSON.parse(chunk.toString()));
    });
  }).on('error', function (e) {
    console.log("EERR", e)
    next(e);
  });
})