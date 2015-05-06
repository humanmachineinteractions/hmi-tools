var T2W = require('./number2text');

function dollars2text(d) {
  d = d.trim();
  var translator = new T2W("EN_US");
  var sidx = d.indexOf("$");
  if (sidx != -1)
    d = d.substring(sidx + 1);
  var a = d.split(".");
  var d = Number(a[0]);
  var c = Number(a[1]);
  var s = translator.toWords(d) + " dollars";
  if (c != 0)
    s += " and " + translator.toWords(c) + " cent" + (c == 1 ? "" : "s");
  return s;
}

if (module.exports) {
  module.exports = dollars2text;
}

