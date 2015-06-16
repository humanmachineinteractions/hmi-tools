var fs = require('fs');
var _ = require('lodash');
var colors = require('colors');
var stats = require('../../phone/stats');
var utils = require('../../utils');

var scripts = ['be', 'messaging', 'cameraman', 'videoconferencing', 'storytelling', 'homewatch', 'lists', 'reminders', 'weather',
  'kitchen', 'music', 'sports', 'entertainment', 'locations'];
var biggy = ['news', 'tech', 'ent', 'long'];

var p = [];
scripts.forEach(function (s) {
  p.push(__dirname + '/data/ph/' + s + '.ranked.ph')
});
biggy.forEach(function (s) {
  p.push(__dirname + '/../../krawl/data/ph/' + s + '.ranked2.tsv');
})


stats.composite(p, function (err, a) {
  //var s = stats.unique(b, {n: 2, removeStress: true});
  //console.log(s);
  utils.readLines(__dirname + '/../../sc.ph', function (err, b) {
    //console.log('DIPHONES'.rainbow.bold);
    //var d = stats.diff2(a, b, {n: 2, removeStress: true});
    //console.log(d.intersect.length, _.keys(d.only_in_a).length, 'only in b ' + _.keys(d.only_in_b).length);
    //console.log('ONLY IN A'.rainbow.bold);
    //_.each(d.only_in_a, function (aa) {
    //  var al = aa.line.split('\t');
    //  findPhones(aa.phones, al[1].split(' '), al[0]);
    //  findPhones(aa.phones, al[1].split(' '), al[0]);
    //});
    //console.log('ONLY IN B'.rainbow.bold);
    //_.each(d.only_in_b, function (bb) {
    //  var bl = bb.line.split('\t');
    //  findPhones(bb.phones, bl[1].split(' '), bl[0]);
    //});
    //
    console.log('T R I P H O N E S'.rainbow.bold);
    var d = stats.diff2(a, b, {n: 3, removeStress: true});
    //console.log(d.intersect.length, _.keys(d.only_in_a).length, 'only in b ' + _.keys(d.only_in_b).length);
    console.log('O N L Y   I N   B'.rainbow.bold);
    _.each(d.only_in_b, function (bb) {
      var bl = bb.line.split('\t');
      findPhones(bb.phones, bl[1].split(' '), bl[0]);
    });
  });
});

function findPhones(phs, line, text) {
  var idx = -1;
  for (var i = 0; i < line.length - phs.length + 1; i++) {
    var f = true;
    for (var j = 0; j < phs.length; j++) {
      var l = line[i + j];
      if (l.match(/..(\d)/))
        l = l.substring(0, 2);
      if (l != phs[j]) {
        f = false;
        break;
      }
    }
    if (f) {
      idx = i;
      break;
    }
  }
  var sidx = -1;
  var sidxf = false;
  var s = '';
  for (var i = 0; i < line.length; i++) {
    var ph = line[i];
    if (ph == '_') {
      ph = ' ';
      if (!sidxf)
        sidx++;
    }
    if (i >= idx && i < idx + phs.length) {
      sidxf = true;
      s += ph.green;
    }
    else
      s += ph.grey;

  }
  console.log(s + ' ' + text.split(/[\s-]/)[sidx]);
}

