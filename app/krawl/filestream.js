var fs = require('fs');

function Stream(fname, ready) {
  var self = this;
  self.fname = fname;
  self.ids = {};
  self.pool = [];
  self.writing = false;
  self.ended = false;
  self.stream = fs.createWriteStream(fname);//, {'flags': 'a'}
  self.stream.once('open', function (fd) {
    ready(self);
  });
}

Stream.prototype.writeln = function (s) {
  s = s.trim();
  if (!s)
    return;
  if (this.ids[s])
    return;
  this.ids[s] = true;
  this.pool.push(s);
  if (!this.writing) {
    this.writing = true;
    this._writeln();
  }
}
Stream.prototype._writeln = function () {
  var self = this;
  var stream = self.stream;

  function drnr() {
    if (self.pool.length == 0) {
      self.writing = false;
      if (self.ended)
        self._end();
      return;
    }
    var s = self.pool.shift();
    var ok = stream.write(s + "\n");
    if (ok) {
      process.nextTick(drnr);
    } else {
      stream.once('drain', function () {
        process.nextTick(drnr);
      });
    }
  }

  drnr();
}

Stream.prototype.end = function () {
  this.ended = true;
  if (this.pool.length == 0)
    this._end();
}
Stream.prototype._end = function () {
  console.log("end "+this.fname)
  this.stream.end();
}
exports.Stream = Stream;