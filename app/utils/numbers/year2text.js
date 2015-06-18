var T2W = require('./number2text');
var translator = new T2W("EN_US");

function year2text(yr) {
  var y0 = Math.floor(yr / 100);
  var y1 = yr - (y0 * 100);
  if (y0/10 == Math.floor(y0/10) && y1 < 10)
    return translator.toWords(yr);
  if (y1 == 0)
    return translator.toWords(y0) + " hundred";
  else if (y1 < 10)
    return translator.toWords(y0) + " oh " + translator.toWords(y1);
  else
    return translator.toWords(y0) + " " + translator.toWords(y1);
}

if (module.exports) {
  module.exports = year2text;
}

