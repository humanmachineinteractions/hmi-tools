var Stream = require('./filestream').Stream;
var y2t = require('../utils/numbers/year2text');
new Stream('data/years.txt', function (out) {
  for (var i = 0; i < 4000; i++) {
    out.writeln(y2t(i));
  }
})
