var fs = require('fs');
var utils = require('../utils');
var CmuDict = require('../phone/cmu/cmudict');
function transcribe(infile, outfile, complete) {
  var stream = fs.createWriteStream(outfile);
  stream.once('open', function (fd) {
    var d = new CmuDict();
    d.on('ready', function () {
      utils.readLines(infile, function (data) {
        stream.write(d.getTranscription(data) + '\n');
      }, function () {
        stream.end();
        complete();
      });
    });
  });
}


transcribe(__dirname + '/template-0.txt', __dirname + '/template-0.ph', function () {
  console.log("!");
})