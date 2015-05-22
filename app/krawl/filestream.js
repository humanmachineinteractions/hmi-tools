var fs = require('fs');

function Stream(fname, ready) {
  var self = this;
  self.ids = {};
  var stream = fs.createWriteStream(fname, {'flags': 'a'});
  stream.once('open', function (fd) {
    console.log('opened', fd);
    self.stream = stream;
    ready(self);
  });
}

Stream.prototype.writeln = function (s) {
  if (this.ids[s])
    return;
  this.ids[s] = true;
  this.stream.write(s + "\n");
  //console.log(s);
}

Stream.prototype.end = function () {
  this.stream.end();
}

exports.Stream = Stream;