var fs = require('fs');
var utils = require('../utils');
var random = require('../utils/random');
var names = require('./names');
var books = require('./books');
var datetime = require('./datetime');

function generate(infile, outfile, options, complete) {
  var stream = fs.createWriteStream(outfile);
  stream.once('open', function (fd) {
    utils.readLines(infile, function (data) {
      if (data.indexOf('[') != -1) {
        for (var i = 0; i < 4; i++) {
          var td = data;
          options.props.forEach(function (o) {
            for (var c = 0; c < 2; c++) {
              if (o.values)
                td = td.replace(o.exp, random.oneOf(o.values));
              else if (o.f)
                td = td.replace(o.exp, o.f(data));
            }
          });
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

console.log('//////////////////////////////////////////////////////////////////')

var infile = __dirname + '/data/template.txt';
var outfile = __dirname + '/data/template-0.txt';
var props = [
  {exp: /\[(familymember|familyname|babyname|julie)\.?]/, values: names.People},
  {exp: /\[petname]/, values: names.Pets},
  {exp: /\[story]/, values: books.Childrens},
  {exp: /\[(DAY|dayofweek)]/, values: datetime.DaysOfWeek},
  {exp: /\[HH:MM]/, f: generateTime}
];
generate(infile, outfile, {props: props}, function (err) {
  console.log(err);
});

// util

var T2W = require('../utils/numbers/number2text');
var translator = new T2W('EN_US');

function generateTime() {
  if (random.yes(.05)) {
    return random.yes() ? 'midnight' : 'noon';
  }
  var hr = random.int(1, 12);
  var min = random.int(0, 59);
  var s = translator.toWords(hr);
  s += ' ';
  if (min == 0)
    s += 'oclock';
  else if (min < 10)
    s += 'oh ' + translator.toWords(min);
  else
    s += translator.toWords(min);
  if (min != 0) {
    s += ' ';
    if (random.yes())
      s += 'pm';
    else
      s += 'am';
  }
  return s;
}