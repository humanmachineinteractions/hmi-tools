var utils = require('../utils');
var random = require('../utils/random');
var random = require('../utils/numbers');
var names = require('./names');
var books = require('./books');
var datetime = require('./datetime');

function generate(template, options, complete) {
//        options.props.forEach(function (o) {
//        console.log(o.exp)
//      });
//return;
  utils.readLines(__dirname + '/template.txt', function (data) {
    if (data.indexOf('[') != -1) {
      options.props.forEach(function (o) {
        if (o.values)
          data = data.replace(o.exp, random.oneOf(o.values));
        else if (o.f)
          data = data.replace(o.exp, o.f(data));
      });
    }
    //console.log(data)
    if (data.indexOf('[') != -1)
      console.log(data);
  }, function () {
    complete();
  });
}

console.log('//////////////////////////////////////////////////////////////////')


var props = [
  {exp: /\[(familymember|familyname|babyname|julie)\.?]/g, values: names.People},
  {exp: /\[petname]/g, values: names.Pets},
  {exp: /\[story]/g, values: books.Childrens},
  {exp: /\[(DAY|dayofweek)]/g, values: datetime.DaysOfWeek},
  {exp: /\[HH:MM]/g, f: hoursAndMinutes}
];
generate(__dirname + '/template.txt', {props: props}, function (err) {
  console.log(err);
});

// util
function hoursAndMinutes() {
  return "[HEY]"
}