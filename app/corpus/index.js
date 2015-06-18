var fs = require('fs');
var _ = require('lodash');
var utils = require('../utils');
var random = require('../utils/random');

function generate(infile, outfile, options, complete) {
  var stream = fs.createWriteStream(outfile);
  stream.once('open', function (fd) {
    utils.readLines(infile, function (data) {
      if (data.indexOf('[') != -1) {
        for (var i = 0; i < 4; i++) {
          var td = processRow(options.props, data);
          if (td.indexOf('[') != -1)
            console.log('could not expand ' + td);
          else
            stream.write(td + '\n');
        }
      } else {
        stream.write(data + '\n');
      }

    }, function () {
      stream.end();
      complete();
    });
  });
}

function processRow(props, data) {
  var td = data;
  props.forEach(function (o) {
    if (o.values)
      td = td.replace(o.exp, random.oneOf(o.values));
    else if (o.f)
      td = td.replace(o.exp, random.oneOf(o.f(td)));
  });
  return td;
}

function p2(s) {
  var i = 0;
  var reg = /\[(.*?)]/g;
  var match = reg.exec(s);
  var p = [];
  var unq = {};
  while (match != null) {
    var ms = match[0];
    p.push(s.substring(i, match.index));
    p.push(ms);
    unq[ms] = {};
    i = match.index + ms.length;
    match = reg.exec(s);
  }
  p.push(s.substring(i));
  return {length: p.length, tokens: p, unique: unq};
}

function p3(props, s) {
  var ps = p2(s);
  if (ps.length == 1)
    return ps.tokens;
  for (var p in ps.unique) {
    var psu = ps.unique[p];
    props.forEach(function (o) {
      if (p.match(o.exp)) {
        if (!o.values || o.values.length == 0) {
          console.log("CANT FIND VALUES FOR '" + p + "'");
          return;
        }
        psu.values = _.shuffle(o.values);
        psu.length = o.values.length;
        psu.index = 0;
      }
    });
  }
  var r = [];
  var going = true;
  while (going) {
    var x = '';
    for (var i = 0; i < ps.length; i++) {
      var t = ps.tokens[i];
      if (ps.unique[t]) {
        var psu = ps.unique[t];
        try {
          x += psu.values[psu.index % psu.length];
          psu.index++;
          if (psu.index == psu.length)
            going = false;
        } catch (e) {
          console.log('?', t, psu, s)
          return [];
        }
      }
      else {
        x += t;
      }
    }
    r.push(x);
  }
  return r;
}
exports.processRow = p3;
