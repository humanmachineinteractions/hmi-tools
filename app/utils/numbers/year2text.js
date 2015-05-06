var T2W = require('./number2text');

function year2text(yr) {
  var translator = new T2W("EN_US");
  var y0 = Math.floor(yr / 100);
  var y1 = yr - (y0 * 100);
  console.log(y0, y1)
  if (y0 != 20)
    if (y1 == 0)
      return translator.toWords(y0) + " hundred";
    else if (y1 < 10)
      return translator.toWords(y0) + " oh " + translator.toWords(y1);
    else
      return translator.toWords(y0) + " " + translator.toWords(y1);
  else
    return translator.toWords(yr);
}

if (module.exports) {
  module.exports = year2text;
}