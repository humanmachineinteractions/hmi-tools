var StanfordSimpleNLP = require('stanford-simple-nlp');

var s = new StanfordSimpleNLP(function (err) {
  s.process('This is so good.', function (err, result) {
    console.log(err, result)
  });
});