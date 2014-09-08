var express = require('express');
var app = express();
exports.app = app;


app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res, next){
  res.render('index.ejs');
});