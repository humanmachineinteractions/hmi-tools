var mongoose = require('mongoose');

var Dictionary = mongoose.model('Dictionary', {
  word: String,
  type: String,
  tags: [String],
  uses: Number,
  details: String
});
exports.Dictionary = Dictionary;
//var Annotation = mongoose.model('Annotation', {word:{type:'Word', }, text: String, });
//var Triple = mongoose.model('Relation', {a:{type:'Word', }, text: String, });

