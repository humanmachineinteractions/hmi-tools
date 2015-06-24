var fs = require('fs');
var _ = require('lodash');
var colors = require('colors');
var stats = require('../../phone/stats');
var search = require('../../phone/search');
var Stream = require('../../krawl/filestream').Stream;
var utils = require('../../utils');
var scripts = require('./scripts');

var p = [];
scripts.jibo.forEach(function (s) {
  p.push(__dirname + '/data/tsv/' + s + '.tsv')
});
scripts.jibopc.forEach(function (s) {
  p.push(__dirname + '/data/tsv/' + s + '.tsv')
});


function compare(di, tri) {
  stats.composite(p, function (err, a) {
    //var s = stats.unique(b, {n: 2, removeStress: true});
    //console.log(s);
    var c;
    utils.readLines(__dirname + '/../../sc.ph', function (err, b) {
      if (di) {
        console.log('DIPHONES'.rainbow.bold);
        var d = stats.diff2(a, b, {n: 2, removeStress: true});
        //console.log(d.intersect.length, _.keys(d.only_in_a).length, 'only in b ' + _.keys(d.only_in_b).length);
        var ms = 'INTERSECTING ' + d.intersect.length;
        console.log(ms.blue.bold);
        ms = 'ONLY IN A ' + _.keys(d.only_in_a).length;
        console.log(ms.green.bold);
        c = 0;
        _.each(d.only_in_a, function (aa) {
          var al = aa.line.split('\t');
          c++;
          console.log(c + ' ' + search.findPhones(aa.phones, al[1].split(' '), al[0]));
        });
        ms = 'ONLY IN B ' + _.keys(d.only_in_b).length;
        console.log(ms.red.bold);
        c = 0;
        _.each(d.only_in_b, function (bb) {
          var bl = bb.line.split('\t');
          c++;
          console.log(c + ' ' + search.findPhones(bb.phones, bl[1].split(' '), bl[0]));
        });
      }
      if (tri) {
        console.log('T R I P H O N E S'.rainbow.bold);
        var d = stats.diff2(a, b, {n: 3, removeStress: true});
        var ms = 'INTERSECTING ' + d.intersect.length;
        console.log(ms.blue.bold);
        ms = 'ONLY IN A ' + _.keys(d.only_in_a).length;
        console.log(ms.green.bold);
        ms = 'ONLY IN B ' + _.keys(d.only_in_b).length;
        console.log(ms.red.bold);
        var seen = {};
        c = 0;
        _.each(d.only_in_b, function (bb) {
          if (bb.nphone.match(/\-|,|\.|!|\?| /))
            return;
          var bl = bb.line.split('\t');
          var t = bl[0];
          //if (!seen[t]) {
          seen[t] = true;
          c++;
          console.log(c + ' ' + search.findPhones(bb.phones, bl[1].split(' '), t));
          //}
        });
      }
    });
  });
}

var b = [];
scripts.biggy2.forEach(function (s) {
  b.push(__dirname + '/../../krawl/data/ph/' + s + '.ph');
});


function find() {
  stats.composite(b, function (err, reallybig) {
    console.log('big corpus is ' + reallybig.length + ' lines.')
    var trindex = stats.unique(reallybig, 3);
    stats.composite(p, function (err, jibo) {
      utils.readLines(__dirname + '/../../sc.ph', function (err, ref) {
        var d = stats.diff2(jibo, ref, {n: 3, removeStress: true});
        _.each(d.only_in_b, function (bb) {
          if (bb.nphone.match(/,/))
            return;
          var r = trindex[bb.nphone];
          if (r && r.lines) {
            for (var i = 0; i < r.lines.length && i < 1; i++) {
              var bl = r.lines[i].split('\t');
              console.log(bb.phones.join(' '))
              console.log(search.findPhones(bb.phones, bl[1].split(' '), bl[0]));
            }
          } else {
            console.log(bb.phones.join(' ') + ' ?');
          }
        });
      });
    });
  });
}

//compare(false, true);
//find();

stats.composite(b, function (err, bs) {
  var bsdi = stats.unique(bs, {n: 2, removeStress: true});
  var bstri = stats.unique(bs, {n: 3, removeStress: true});
  stats.composite(p, function (err, js) {
    var jsdi = stats.unique(js, {n: 2, removeStress: true});
    console.log(">j di " + _.keys(jsdi).length + " out of " + _.keys(bsdi).length)
    var jstri = stats.unique(js, {n: 3, removeStress: true});
    console.log(">j tri", _.keys(jstri).length + " out of " + _.keys(bstri).length);
  });
});