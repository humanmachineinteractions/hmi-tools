var fs = require('fs');
var _ = require('lodash');
var colors = require('colors');
var stats = require('../../phone/stats');
var search = require('../../phone/search');
var utils = require('../../utils');

var scripts = ['be', 'messaging', 'cameraman', 'videoconferencing', 'storytelling', 'homewatch', 'lists', 'reminders', 'weather',
  'kitchen', 'music', 'sports', 'entertainment', 'locations'];
var biggy = ['news', 'tech', 'ent', 'long'];
var biggy2 = ['news', 'tech', 'ent', 'long', 'sports'];

var p = [];
scripts.forEach(function (s) {
  p.push(__dirname + '/data/ph/' + s + '.ranked.ph')
});
biggy.forEach(function (s) {
  p.push(__dirname + '/../../krawl/data/ph/' + s + '.ranked2.tsv');
});

var b = [];
biggy2.forEach(function (s) {
  b.push(__dirname + '/../../krawl/data/ph/' + s + '.ph');
})

function compare() {
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
      //  search.findPhones(aa.phones, al[1].split(' '), al[0]);
      //});
      //console.log('ONLY IN B'.rainbow.bold);
      //_.each(d.only_in_b, function (bb) {
      //  var bl = bb.line.split('\t');
      //  search.findPhones(bb.phones, bl[1].split(' '), bl[0]);
      //});
      //
      console.log('T R I P H O N E S'.rainbow.bold);
      var d = stats.diff2(a, b, {n: 3, removeStress: true});
      //console.log(d.intersect.length, _.keys(d.only_in_a).length, 'only in b ' + _.keys(d.only_in_b).length);
      console.log('O N L Y   I N   B'.rainbow.bold);
      _.each(d.only_in_b, function (bb) {
        var bl = bb.line.split('\t');
        search.findPhones(bb.phones, bl[1].split(' '), bl[0]);
      });
    });
  });
}

function find() {
  stats.composite(b, function (err, reallybig) {
    console.log('big corpus is ' + reallybig.length + ' lines.')
    stats.composite(p, function (err, a) {
      utils.readLines(__dirname + '/../../sc.ph', function (err, b) {
        var d = stats.diff2(a, b, {n: 3, removeStress: true});
        _.each(d.only_in_b, function (bb) {
          var r = search.findLines(bb.phones, reallybig);
          //r.forEach(function (rr) {
          //  var bl = rr.split('\t');
          //  search.findPhones(bb.phones, bl[1].split(' '), bl[0]);
          //});
          if (r.length > 1) {
            var bl = r[0].split('\t');
            console.log(bb.phones.join(' '))
            search.findPhones(bb.phones, bl[1].split(' '), bl[0]);
          } else {
            console.log(bb.phones.join(' ') + ' ?');
          }
        });
      });
    });
  });
}

find();
