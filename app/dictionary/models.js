var mongoose = require('mongoose');

var Word = mongoose.model('Word', {name: String, tags:[String]});
var Annotation = mongoose.model('Annotation', {word:{type:'Word', }, text: String, });
var Triple = mongoose.model('Relation', {a:{type:'Word', }, text: String, });

