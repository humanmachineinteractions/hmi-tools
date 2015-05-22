var fs = require('fs');
var utils = require('../utils')

var b = __dirname + '/data/coverage';
var c = 0;
fs.readdir(b, function (err, files) {
  utils.forEach(files, function (file, next) {
    utils.readLines(b + '/' + file, function (err, txt) {
      try {
        var result = JSON.parse(txt);
        var sentences = arrayify(result.document.sentences.sentence);
        sentences.forEach(function (s) {
          if (s.parsedTree && s.parsedTree.text != null) {
            console.log(c, s.parsedTree.text);
            c++;
          }
        });
        next();
      } catch (e) {
        console.error(file);
        next();
      }
    })
  }, function () {
    console.log('done');
  })
});


function write_nlp_info(docs, log, complete) {
  var c = 0;
  var ph_stats = new stats.Mapper();
  var ner_stats = new stats.Mapper();
  utils.forEach(docs, function (doc, next) {
      console.log(c);
      var pp = doc.text.split("\n");
      utils.forEach(pp, function (p, next) {
        if (!p) return next();
        process_nlp(p, log, next);
      }, next);
    }, function () {
      log.end();
      console.log(c + ' lines processed');
      console.log(ph_stats.get());
      console.log(ner_stats.get());
      complete();
    }
  )
}

function process_nlp(p, log, complete) {
  coreNLP.process(p, function (err, result) {
    console.log('--------------------------------------');
    var rs = [];
    //console.log(err, result);
    //console.log(util.inspect(result, {depth: 30, colors: true}));
    //console.log(JSON.stringify(result));
    console.log(err, result)
    var sentences = arrayify(result.document.sentences.sentence);
    sentences.forEach(function (s) {
      if (s.parsedTree && s.parsedTree.text != null) {
        log.writeln(s.parsedTree.text);
      }
      //var tokens = arrayify(s.tokens.token);
      //tokens.forEach(function (t) {
      //  var ner = (t.NER != 'O') ? t.NER : '';
      //  console.log(">", t.word, ner); //t.POS
      //  if (ner) {
      //    ner_stats.add(ner, t.word);
      //  }
      //});
      //s.parsedTree.parsedList.forEach(function (p) {
      //  p.children.forEach(function (c0) {
      //    c0.children.forEach(function (c1) {
      //      console.log("*", c1.type);
      //      ph_stats.add(c1.type);
      //    });
      //  });
      //})
    });
    complete(err, result)
  });
}


function arrayify(a) {
  if (Array.isArray(a)) {
    return a;
  } else {
    return [a];
  }
}