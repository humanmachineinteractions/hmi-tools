var config = require('../cms/config');
var MongoClient = require('mongodb').MongoClient
  , format = require('util').format;
var fs = require('fs');

var m = {};
MongoClient.connect(config.mongoConnectString, function (err, db) {
  if (err) throw err;
  var log = fs.createWriteStream('../phone/log1.txt');
// use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file

  var content = db.collection('contents');
  var cursor = content.find({state: 'crawled', lang: 'en'});
  var c = 0;
  var process = function (err, doc) {
    if (err || doc == null) {
      log.end();
      return;
    }
    var re = /\.|\?|\!/;
    var w = /\s{2,}|\n|\r/g;
    var body = doc.body.split(re);

    for (var i = 0; i < body.length; i++) {
      var b = body[i].trim() + ".";
      b = b.replace(w, ' ');
      if (b.length > 30) {
        if (!m[b]) {
          m[b] = true;
          console.log(c, b);
          log.write(b + '\n');
          c++;
        }

      }
    }
    cursor.nextObject(process);
  };
  cursor.nextObject(process);
});