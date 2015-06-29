var fs = require('fs');
var _ = require('lodash');
var transcribe = require('../../phone/transcribe').transcribeText;
var translator = require('../../phone/translate');
var greedy = require('../../phone/greedy').greedy;
var stats = require('../../phone/stats');
var Stream = require('../../krawl/filestream').Stream;
var utils = require('../../utils');
var corpus = require('../../corpus');

var BP = __dirname + '/data';
var title = null;
var stream;

function simple(name) {
  if (name.indexOf('.') != -1)
    return name.split('.')[0];
  else
    return name;
}
function textFile(name) {
  return BP + '/gen/' + simple(name) + '.txt';
}
function rankedFile(name) {
  return BP + '/ph/' + simple(name) + '.ranked.ph';
}
function phoneFile(name) {
  return BP + '/ph/' + simple(name) + '.ph'
}
function tsvFile(name) {
  return BP + '/tsv/' + simple(name) + '.tsv';
}


function createScripts(which) {
  var goo = require('./goo-sheet');
  var D = require('./dynamic');
  var data = {};
  if (which)
    which.forEach(function (n) {
      data[n] = D[n];
    });
  else {
    console.log('*');
    data = D;
  }
  goo.processSheet('1C-xWDFYpjZMxorOkre372U4BzESAMOITbqhf7o3lyHc',
    function (sheet, next) {
      title = sheet.title.substring(7).toLowerCase().trim();
      if (stream)
        stream.end();
      if (!data[title]) {
        console.log('skipping "' + title + '"');
        next();
        return;
      } else {
        console.log('processing ' + sheet.title);
      }
      new Stream(textFile(title), function (out) {
        stream = out;
        next();
      });
    },
    function (row, c) {
      if (!data[title])
        return;
      var r = corpus.processRow(data[title], row);
      r.forEach(function (s) {
        console.log(s);
        stream.writeln(s);
      });
      if (c % 100 == 0)
        console.log('row ' + c);
    },
    function () {
      console.log('done create from src');
    });
}


function createTranscript(which) {
  var m = null;
  if (which) {
    m = {};
    which.forEach(function (w) {
      m[w + '.txt'] = true;
    });
  }
  fs.readdir(BP + '/gen', function (err, files) {
    utils.forEach(files, function (file, next) {
      console.log(file)
      if (!m || m[file]) {
        transcribe(BP + '/gen/' + file, phoneFile(file), {lexonly: false}, function () { //{}
          console.log("!", file);
          next();
        });
      } else {
        next();
      }
    }, function () {
      console.log("done transcribe")
    });
  });
}

var scripts = require('./scripts');

function doGreedy(which) {
  var scriptPaths = [];
  scripts.jibo.forEach(function (s, i) {
    if (i < 7)
      scriptPaths.push(rankedFile(s))
  });
  console.log(scriptPaths)

  stats.composite(scriptPaths, function (err, composite) {
    console.log('Loaded composite ' + composite.length + ' lines');
    var covered = stats.unique(composite, 3);
    utils.forEach(which ? which : scripts.jibo, function (script, next) {
      var rfile = rankedFile(script);
      fs.exists(rfile, function (b) {
        if (b) {
          console.log('Skipping ' + script + ' because ranked file exists...')
          next();
        } else {
          console.log('Starting greedy on ' + script + '...')
          greedy(phoneFile(script), rfile, {covered: covered, max_line_length: 10000, min_line_length: 1}, function () {
            utils.readLines(rfile, function (err, lines) {
              composite = composite.concat(lines);
              console.log("Recomputing stats with " + composite.length + " lines!");
              covered = stats.unique(composite, 3);
              next();
            });
          });
        }
      }, function () {
        console.log("done greedy2")
      })
    })
  });
}


function genCsv(which) {
  var m = null;
  if (which) {
    m = {};
    which.forEach(function (w) {
      m[w] = true;
    });
  }
  var c = 0;
  fs.readdir(BP + '/gen', function (err, files) {
    utils.forEach(files, function (file, next) {
      var name = file.substring(0, file.length - 4);
      console.log(name)
      if (!m || m[name]) {
        var f = rankedFile(name);
        fs.exists(f, function (b) {
          if (b) {
            var d = tsvFile(name);
            new Stream(d, function (out) {
              utils.readLines(f, function (line) {
                line = line.split('\t');
                out.writeln(line[0])
                c++;
                console.log(name, c)
              }, function () {
                out.end();
              });
            })
          } else {
            console.log("! no go !", f, b);
          }
          next();
        });
      } else {
        next();
      }
    }, function () {
      console.log("done csv", c)
    });
  })
}

var FINAL_LENGTHS = {
  'be': Number.MAX_VALUE,
  'messaging': Number.MAX_VALUE,
  'cameraman': Number.MAX_VALUE,
  'videoconferencing': Number.MAX_VALUE,
  'storytelling': Number.MAX_VALUE,
  'homewatch': Number.MAX_VALUE,
  'lists': Number.MAX_VALUE,
  'reminders': 688,
  'weather': 630,
  'kitchen': 250,
  'music': 500,
  'sports': 71,
  'entertainment': 500,
  'locations': 500,
  'pc-news': 1699,
  'pc-tech-biz': 1699,
  'pc-ent': 1299,
  'pc-long': 1299
}
var ABC = ['a', 'b', 'c', 'd'];
var d;

// /home/vagrant/sw/festival/bin/festival --script ~/deploy/dump.scm "text"

function finalize() {
  var PhoneDict = require('../../phone/phonedict');
  d = new PhoneDict();
  d.on('ready', function () {
    translator.init(function () {
      var goo = require('./goo-sheet');
      var title, tt, cc;
      var tmap = {};
      goo.processSheet2('12NUJQkjgVXvnOpaCMkR2H-cCqtT0pqz_oN_2XRQ0jEM',
        function (sheet, next) {
          title = sheet.title;
          tt = title.substring(0, 3);
          if (tmap[tt]) {
            console.log("ALREADY SAW " + tt);
            tmap[tt] = true;
          }
          if (stream)
            stream.end();
          new Stream(tsvFile(title), function (out) {
            cc = -1;
            stream = out;
            next();
          });
        },
        function (row, c, next) {
          cc++;
          processFinalRow(title, tt, row, cc, next);
        },
        function (err, c) {
          console.log('processed some of ' + c + ' lines, moving on...');
          var ci = -1;
          goo.processSheet2('1qEZkFvOu8C-4auLmuw2xCy8_JHRdzInnvqFwwMVuJvo',
            function (sheet, next) {
              title = sheet.title;
              tt = 'pc';
              if (stream)
                stream.end();
              ci++;
              new Stream(tsvFile(tt + ABC[ci] + '.tsv'), function (out) {
                cc = -1;
                stream = out;
                next();
              });
            },
            function (row, c, next) {
              if (row.title.match(/Row: \d+/))
                return next();
              cc++;
              processFinalRow(title, tt + ABC[ci], row, cc, next);
            },
            function () {
              console.log('done final');
              if (stream)
                stream.end();
            });
        });
    });
  });
}

function finalize1(which) {
  var m = null;
  if (which) {
    m = {};
    which.forEach(function (w) {
      m[w] = true;
    });
  }
  var PhoneDict = require('../../phone/phonedict');
  d = new PhoneDict();
  d.on('ready', function () {
    translator.init(function () {
      var goo = require('./goo-sheet');
      var title, tt, cc;
      goo.processSheet2('12NUJQkjgVXvnOpaCMkR2H-cCqtT0pqz_oN_2XRQ0jEM',
        function (sheet, next) {
          title = sheet.title;
          tt = title.substring(0, 3);
          if (stream)
            stream.end();
          if (m[title]) {
            new Stream(tsvFile(title), function (out) {
              cc = -1;
              stream = out;
              next();
            });
          } else {
            console.log('skip ' + title)
            next();
          }
        },
        function (row, c, next) {
          if (m[title]) {
            cc++;
            processFinalRow(title, tt, row, cc, next);
          } else {
            next();
          }
        },
        function (err, c) {
          console.log('processed some of ' + c + ' s...');
        });
    });
  });
}

function finalize2() {
  var PhoneDict = require('../../phone/phonedict');
  d = new PhoneDict();
  d.on('ready', function () {
    translator.init(function () {
      var goo = require('./goo-sheet');
      var title, tt, cc;
      var ci = -1;
      goo.processSheet2('1qEZkFvOu8C-4auLmuw2xCy8_JHRdzInnvqFwwMVuJvo',
        function (sheet, next) {
          title = sheet.title;
          tt = 'pc';
          if (stream)
            stream.end();
          ci++;
          new Stream(tsvFile(tt + ABC[ci] + '.tsv'), function (out) {
            cc = -1;
            stream = out;
            next();
          });
        },
        function (row, c, next) {
          if (row.title.match(/Row: \d+/))
            return next();
          cc++;
          processFinalRow(title, tt + ABC[ci], row, cc, next);
        },
        function () {
          console.log('done final');
          if (stream)
            stream.end();
        });
    });
  });
}

var exec = require('child_process').exec;
function processFinalRowFFE(title, tt, row, c, next) {
  if (FINAL_LENGTHS[title] < c) {
    process.nextTick(next);
    return;
  }
  var p = '0000' + c;
  p = p.substring(p.length - 4, p.length);
  exec('/home/vagrant/sw/festival/bin/festival --script ~/deploy/dump.scm "' + row.title + '"', function (error, stdout, stderr) {
    var phs = stdout.trim().split(' ');
    var tphs = translator.translate(phs, {from: 'FESTVOX', to: 'IPA'}).replace(/_/g, ' ').trim();
    stream.writeln(tt + p + '\t' + row.title + '\t' + tphs);
    console.log(tt + p + '\t' + row.title + '\t' + tphs)
    process.nextTick(next);
  });
}

function processFinalRowHFE(title, tt, row, c, next) {
  if (FINAL_LENGTHS[title] < c) {
    process.nextTick(next);
    return;
  }
  var p = '0000' + c;
  p = p.substring(p.length - 4, p.length);
  d.getTranscriptionInfo(row.title, function (err, ph) {
    //var tphs = translator.translate(ph.phones.toString(), {from: 'ARPABET', to: 'IPA'}).replace(/_/g, ' ').trim();
    //stream.writeln(tt + p + '\t' + row.title + '\t' + tphs);
    var tphs = ph.phones.toString();
    stream.writeln(row.title + '\t' + tphs);
    console.log(tt + p + ' ' + row.title)
    process.nextTick(next);
  });
}


function lineCount() {
  var scriptPaths = [];
  scripts.jibo.forEach(function (s) {
    scriptPaths.push(tsvFile(s))
  });
  stats.composite(scriptPaths, function (err, composite) {
    console.log("TOTAL = " + composite.length)
    scriptPaths = [];
    scripts.jibopc.forEach(function (s) {
      scriptPaths.push(tsvFile(s))
    });
    stats.composite(scriptPaths, function (err, composite) {
      console.log("TOTAL = " + composite.length)
    });
  });
}

function createPDF() {
  var PhoneDict = require('../../phone/phonedict');
  d = new PhoneDict();
  d.on('ready', function () {
    translator.init(function () {
      var goo = require('./goo-sheet');
      var all = [];
      goo.processSheet2('1IE4FqscIhr22Cyjc-mHc8DKKqj4OEuwC6UsayL14MkA',
        function (sheet, next) {
          console.log(sheet);
          next();
        },
        function (row, c, next) {
          all.push([row.uid, row.text, row.transcription]);
          next();
        },
        function () {
          console.log('done with ' + all.length);
          var sall = _.shuffle(all);
          for (var i = 0; i < 300; i += 100) { //|| i < sall.length
            var is = '0000' + i;
            writePDF(sall.slice(i, i + 100), 'pdf/script' + is.substring(is.length - 4) + '.pdf');
          }
        });
    });
  });

}

function writePDF(a, p) {
  var pp = 15;
  var tableBody = [];
  var content = [];
  var docDefinition = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    content: content,
    footer: function (page, pages) {
      return {
        columns: [
          {text: 'JIBO / ' + p.substring(4, p.length-4)},
          {
            alignment: 'right',
            text: [
              {text: page.toString()}, ' of ',
              {text: pages.toString()}
            ]
          }
        ],
        margin: [40, 0]
      };
    }
  }
  for (var h = 0; h < a.length; h += pp) {
    var tableBody = [];
    for (var i = h; i < h + pp && i < a.length; i++) {
      var row = a[i];
      var s = 11;
      var c = i % 2 == 0 ? '#cccccc' : 'white';
      tableBody.push([
        {text: row[0], fontSize: s, fillColor: c},
        {text: row[1], fontSize: s, fillColor: c},
        {text: row[2], fontSize: s, fillColor: c}])
    }
    var o = {
      table: {
        widths: [70, '*', '*'],
        body: tableBody
      },
      layout: glayout
    }
    if (h + pp < a.length)
      o.pageBreak = 'after';
    content.push([o]);
  }
  //console.log(tableBody)
  var fonts = {
    Roboto: {
      normal: '../../fonts/dejavu/DejaVuSans.ttf',
      //bold: '../../fonts/Roboto-Medium.ttf',
      //italics: '../../fonts/Roboto-Italic.ttf',
      //bolditalics: '../../fonts/Roboto-Italic.ttf'
    }
  };

  var PdfPrinter = require('pdfmake');
  var printer = new PdfPrinter(fonts);
  var pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(fs.createWriteStream(p));
  pdfDoc.end();
}
var glayout = {
  hLineWidth: function (i, node) {
    return 0;
  },
  vLineWidth: function (i, node) {
    return 0;
  },
  //hLineColor: function (i, node) {
  //  return 'black';
  //},
  //vLineColor: function (i, node) {
  //  return 'black';
  //},
  // paddingLeft: function(i, node) { return 4; },
  // paddingRight: function(i, node) { return 4; },
  paddingTop: function (i, node) {
    return 3;
  },
  paddingBottom: function (i, node) {
    return 6;
  }
}

var which = null;
if (process.argv.length > 3) {
  which = [];
  for (var i = 3; i < process.argv.length; i++)
    which.push(process.argv[i]);
}

var processFinalRow = processFinalRowHFE;

if (process.argv[2] == 'script')
  createScripts(which);
else if (process.argv[2] == 'transcript')
  createTranscript(which);
else if (process.argv[2] == 'greedy')
  doGreedy(which);
else if (process.argv[2] == 'tsv')
  genCsv(which);
else if (process.argv[2] == 'final')
  finalize();
else if (process.argv[2] == 'final1')
  finalize1(which);
else if (process.argv[2] == 'final2')
  finalize2();
else if (process.argv[2] == 'count')
  lineCount();
else if (process.argv[2] == 'pdf')
  createPDF();
//writePDF([['aa', 'Theres one thing on the roadmap for v2 (no deadline however) - make the library hackable, so you can write plugins to:', 'map for v2 (no deadline however) - make the library hackable, so you can write plu'], ['dd', 'ee', 'ff']]);