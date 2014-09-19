var fs = require('fs');

// UTILITY

exports.readLines = function(filepath, func, done) {
  var rs = fs.createReadStream(filepath);
  var remaining = '';
  rs.on('data', function (data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      func(line);
      index = remaining.indexOf('\n');
    }
  });
  rs.on('end', function () {
    if (remaining.length > 0) {
      func(remaining);
    }
    done();
  });
}