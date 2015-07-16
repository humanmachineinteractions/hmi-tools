var fs = require('fs');
var _ = require('lodash');
var transcribe = require('../../phone/transcribe').transcribeText;
var translator = require('../../phone/translate');
var greedy = require('../../phone/greedy').greedy;
var stats = require('../../phone/stats');
var Stream = require('../../krawl/filestream').Stream;
var utils = require('../../utils');
var corpus = require('../../corpus');
var fest = require('../../phone/fest');
var praat = require("../../phone/praat");
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

function finalize(processFinalRow) {
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

function finalize1(which, processFinalRow) {
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
  fest_trans_from_text(row.title, function (err, phs, tphs) {
    stream.writeln(tt + p + '\t' + row.title + '\t' + tphs);
    console.log(tt + p + '\t' + row.title + '\t' + tphs)
    process.nextTick(next);
  });
}

function fest_trans_from_text(t, complete) {
  fest.transcriptionFromText(t, function (err, data) {
    if (err) return complete(error);
    var phs = data.split(' ');
    var tphs = translator.translate(phs, {from: 'FESTVOX', to: 'IPA'}).replace(/_/g, ' ').trim();
    complete(null, row.title, tphs)
  })
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

var ROW_MATCH = {};

function createPDFs() {
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
          var segs = [];
          for (var i = 0; i < sall.length; i += 100) {
            var is = '00000' + (i + 100);
            segs.push({script: sall.slice(i, i + 100), i: i, fnum: is.substring(is.length - 5)});
          }
          utils.forEach(segs, function (seg, next) {
            console.log(seg.fnum);
            writePDF(seg.script, 'pdf/script' + seg.fnum + '.pdf', next);
          }, function () {
            new Stream('pdf/map.json', function (out) {
              out.writeln(JSON.stringify(ROW_MATCH));
              out.end();
            })
          });
        });
    });
  });

}

function writePDF(a, p, complete) {
  var pp = 15;
  var content = [];
  var docDefinition = {
    pageSize: 'A4',
    pageOrientation: 'landscape',
    content: content,
    footer: function (page, pages) {
      return {
        columns: [
          {text: 'JIBO / ' + p.substring(4, p.length - 4)},
          {
            alignment: 'right',
            text: [
              {text: page.toString()},
              ' of ',
              {text: pages.toString()}
            ]
          }
        ],
        margin: [40, 0]
      };
    }
  }
  ROW_MATCH[p] = {};
  for (var h = 0; h < a.length; h += pp) {
    var tableBody = [];
    for (var i = h; i < h + pp && i < a.length; i++) {
      var row = a[i];
      var s = 11;
      var c = i % 2 == 0 ? '#cccccc' : 'white';
      var l = '0000' + (i + 1);
      var uid = row[0];
      ROW_MATCH[p][l] = uid;
      tableBody.push([
        {text: l.substring(l.length - 4), fontSize: s, fillColor: c},
        {text: uid, fontSize: s, fillColor: c},
        {text: row[1], fontSize: s, fillColor: c},
        {text: row[2], fontSize: s, fillColor: c}
      ])
    }
    var o = {
      table: {
        widths: [70, 70, '*', '*'],
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
  pdfDoc.once('end', complete);
}
var glayout = {
  hLineWidth: function (i, node) {
    return 0;
  },
  vLineWidth: function (i, node) {
    return 0;
  },
  paddingTop: function (i, node) {
    return 3;
  },
  paddingBottom: function (i, node) {
    return 6;
  }
}

function featuresToXlabelToPraat(dir, outdir, complete) {
  var xltotg = require('../../phone/praat/xltotg');
  translator.init(function () {
    fs.readdir(dir, function (err, files) {
      if (err) return complete(err);
      files.forEach(function (file) {
        fest.dumpFromUtterance(dir + file, function (err, feats) {
          if (err) return complete(err);
          var tg = xltotg.convert(feats, translator);
          new Stream(outdir + file.substring(0, file.length - 4) + ".TextGrid", function (o) {
            o.writeln(tg);
          });
        });
      });
    });
  });
}

var audio_root = "/home/vagrant/jibo-audio/audio/audio_source_edits";
var build_root = "/home/vagrant/builds";
var final_root = "/home/vagrant/app/client/jibo/data/";

function get_wp_etc() {
  var work_package_line_number_to_uid = JSON.parse(fs.readFileSync(__dirname + "/pdf/map.json"));
  var work_package_by_uid = {};
  for (var p in work_package_line_number_to_uid) {
    var s = p.substring(4, p.length - 4);
    work_package_line_number_to_uid[s] = work_package_line_number_to_uid[p];
    delete work_package_line_number_to_uid[p];
    for (var pl in work_package_line_number_to_uid[s]) {
      var spl = pl.substring(pl.length - 4);
      work_package_line_number_to_uid[s][spl] = work_package_line_number_to_uid[s][pl];
      delete work_package_line_number_to_uid[s][pl];
    }
    for (var q in work_package_line_number_to_uid[s]) {
      var u = work_package_line_number_to_uid[s][q];
      work_package_by_uid[u] = {script: s, line: q.substring(q.length - 4)};
    }
  }
  return {
    getScript: function (script) {
      return work_package_line_number_to_uid[script];
    },
    getUid: function (script, line) {
      return work_package_line_number_to_uid[script][line];
    },
    getByUid: function (uid) {
      return work_package_by_uid[uid];
    }
  }
}

function createMonoLabels(which) {
  var shortid = require('shortid');
  shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_.');
  var script_by_uid = JSON.parse(fs.readFileSync(__dirname + "/data/final.json"));
  var build_id = which.join("");
  var dir = build_root + "/" + build_id;
  fs.mkdir(dir, function () {
    var cmd = "cd " + dir + "; /home/vagrant/sw/festvox/src/clustergen/setup_cg hmi us " + build_id;
    fest.execFestvox(cmd, function (err, stdout, stderr) {
      console.log(err, stdout, stderr);
      createLabels2(which, dir, script_by_uid);
    })
  })
}

function createLabels2(which, build_dir, script) {
  var wpetc = get_wp_etc();
  fs.readdir(audio_root, function (err, files) {
    var dirs = [];
    files.forEach(function (f) {
      if (fs.lstatSync(audio_root + "/" + f).isDirectory()) {
        dirs.push(f);
      }
    });
    var b = "";
    utils.forEach(which, function (dir, next) {
      var no2uid = wpetc.getScript(dir)
      if (!no2uid)
        throw new Error("NO " + dir);
      var keys = [];
      for (var p in no2uid)
        keys.push(p);
      utils.forEach(keys, function (p, next) {
        var uid = no2uid[p];
        var w = audio_root + "/" + dir + "/" + p + ".wav";
        if (!fs.existsSync(w))
          throw new Error("CANT FIND WAV " + w);
        if (!script[uid])
          throw new Error("CAN FIND SCRIPT LINE WITH UID " + uid);
        //console.log(w + " " + script[uid][1]);
        b += "( " + uid + "  \"" + script[uid][1] + "\" )\n"
        var sil = __dirname + "/slug_300ms.wav";
        var cmd = 'sox ' + sil + ' ' + w + ' ' + sil + ' -r 16000 -b 16 ' + build_dir + "/wav/" + uid + ".wav";
        console.log(cmd);
        exec(cmd, function (err, out) {
          next();
        });
      }, next);
    }, function () {
      new Stream(build_dir + "/etc/txt.done.data", function (out) {
        out.writeln(b);
        out.end();
        fest.execFestvoxStream(build_dir, "./bin/build_cg_voice", function (err, stdout, stderr) {
          console.log("///////////////////////////////////////////////////////////////////////////////")
          console.log("BUILD VOICE COMPLETE " + build_dir)
          createLabels3(build_dir);
        });
      })
    })
  });
}

function createLabels3(festDir) {
  var wpetc = get_wp_etc();
  fs.mkdir(festDir + "/hmi/", function () {
    fs.readdir(festDir + "/festival/utts", function (err, files) {
      utils.forEach(files, function (file, next) {
        var idx = file.lastIndexOf(".");
        var name = file.substring(0, idx);
        var wp = wpetc.getByUid(name);
        var utt_file = festDir + "/festival/utts/" + file;
        var utt_hmm_file = festDir + "/festival/utts_hmm/" + file;
        getTg(fs.existsSync(utt_hmm_file) ? utt_hmm_file : utt_file, function (err, tg) {
          fs.mkdir(festDir + "/hmi/" + wp.script, function () {
            var out = festDir + "/hmi/" + wp.script + "/" + wp.line + ".TextGrid";
            new Stream(out, function (o) {
              o.writeln(tg);
              o.end();
              exec("cp " + festDir + "/wav/" + name + ".wav " + festDir + "/hmi/" + wp.script + "/" + wp.line + ".wav", function () {
                next();
              });
            });
          });
        });
      }, function () {
        console.log("WOW!");
        exec("cp -rf " + festDir + "/hmi " + final_root, function () {
          exec("cp -rf " + festDir + "/festival/utts_hmm " + final_root, function () {
            exec("cp -rf " + festDir + "/festival/utts " + final_root, function () {
              console.log("...whew")
            });
          });
        });
      });
    });
  });
}


function getTg(utt, next) {
  translator.init(function () {
    fest.wordFeaturesFromUtt(utt, function (err, w) {
      if (err) return next(err);
      var words = fest.getWords(w);
      //aggregate into regions and write praat file
      var text = [], arpabet = [], ipa = [];
      words.forEach(function (word) {
        text.push([word.begin, word.end, word.word]);
        arpabet.push([word.begin, word.end, word.phs.toUpperCase()]);
        ipa.push([word.begin, word.end, translator.translate(word.phs, {from: 'FESTVOX', to: 'IPA'})]);
      });
      var tg = praat.TextGrid(words[words.length - 1].end,
        ['IPA', 'ARPABET'],
        {IPA: ipa, ARPABET: arpabet});
      next(null, tg);
    });
  });

}


function createRelations(root) {
  fs.readdir(root, function (err, files) {
    var dirs = [];
    files.forEach(function (f) {
      if (fs.lstatSync(root + "/" + f).isDirectory())
        dirs.push(f);
    });
    utils.forEach(dirs, function (dir, next) {
      fs.readdir(root + "/" + dir, function (err, tgfiles) {
        utils.forEach(tgfiles, function (tgfile, next) {
          if (tgfile.indexOf(".TextGrid") != -1) {
            createRelationsFromTextGrid(root + "/" + dir + "/" + tgfile, next);
          } else {
            next();
          }
        }, next);
      });
    }, function () {

    });
  });
}
function createRelationsFromTextGrid(tgFile, complete) {
  var wpln = get_wp_etc();
  var fp = tgFile.split("/");
  var script = fp[fp.length - 2];
  var filename = fp[fp.length - 1];
  var line = filename.substring(0, 4);
  var uid = wpln.getUid(script, line);
  var utt_file = final_root + "/utts/" + uid + ".utt";
  var utt_hmm_file = final_root + "/utts_hmm/" + uid + ".utt";
  fest.wordFeaturesFromUtt(fs.existsSync(utt_hmm_file) ? utt_hmm_file : utt_file, function (err, w) {
    if (err) return complete(err);
    var festwords = fest.getWords(w);
    var data = praat.readTextGrid(tgFile);
    var words = data["ARPABET"];
    if (festwords.length != words.length) {
      console.log("EEEK " + uid + " " + words);
      return complete();
    }
    var mod = false;
    for (var i = 0; i < words.length; i++) {
      var txt = words[i].text.substring(1, words[i].text.length - 1).trim();
      if (txt.toLowerCase() != festwords[i].phs.trim()) {
        mod = true;
        break;
      }
    }
    if (mod)
      console.log("Transcript modified for " + uid + " / " + script + ":" + line);
    var s = "#\n";
    for (var i = 0; i < words.length; i++) {
      s += words[i].xmax + " 121 " + festwords[i].word + " ; wordlab \"" + (i + 1) + "\" ;\n";
    }
    console.log(s);
    var t = "#\n";
    for (var i = 0; i < words.length; i++) {
      var txt = words[i].text.substring(1, words[i].text.length - 1).trim();
      txt = txt.replace(/\.|\?|!|,|'|"|-|–|—/g, "");
      var ss = txt.split(" ");
      var m = (words[i].xmax - words[i].xmin) / ss.length;
      for (var j = 0; j < ss.length; j++) {
        t += (Number(words[i].xmin) + j * m) + " 121 " + ss[j].toLowerCase() + " \n";
      }
    }
    console.log(t);
    complete();
  });
}

function getFinalScriptFromGoo(complete) {
  var goo = require('./goo-sheet');
  var all = {};
  goo.processSheet2('1IE4FqscIhr22Cyjc-mHc8DKKqj4OEuwC6UsayL14MkA',
    function (sheet, next) {
      console.log(sheet.title);
      next();
    },
    function (row, c, next) {
      all[row.uid] = [c, row.text, row.transcription];
      next();
    },
    function () {
      new Stream(__dirname + "/data/final.json", function (out) {
        out.writeln(JSON.stringify(all));
        out.end();
        if (complete)
          complete(null, all)
      })
    });
}

var which = null;
if (process.argv.length > 3) {
  which = [];
  for (var i = 3; i < process.argv.length; i++)
    which.push(process.argv[i]);
}


if (process.argv[2] == 'script')
  createScripts(which);
else if (process.argv[2] == 'transcript')
  createTranscript(which);
else if (process.argv[2] == 'greedy')
  doGreedy(which);
else if (process.argv[2] == 'tsv')
  genCsv(which);
else if (process.argv[2] == 'final')
  finalize(processFinalRowHFE);
else if (process.argv[2] == 'final1')
  finalize1(which, processFinalRowHFE);
else if (process.argv[2] == 'final2')
  finalize2();
else if (process.argv[2] == 'count')
  lineCount();
else if (process.argv[2] == 'pdf')
  createPDFs();
else if (process.argv[2] == 'final3')
  getFinalScriptFromGoo()
else if (process.argv[2] == 'labels')
  createMonoLabels(which);
else if (process.argv[2] == 'fff')
  createLabels3(which[0]);
else if (process.argv[2] == 'ttt')
  createRelationsFromTextGrid(which[0]);
else if (process.argv[2] == 'feats')
  featuresToXlabelToPraat('/home/vagrant/app/client/jibo/utts/', '/home/vagrant/app/client/jibo/tg/', function (err, c) {
    console.log(err, c)
  });
