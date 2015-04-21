var StanfordSimpleNLP = require('stanford-simple-nlp');

var stanfordSimpleNLP = new StanfordSimpleNLP( function(err) {
  stanfordSimpleNLP.process('This is so good.', function(err, result) {
    console.log(err,result)
  });
});