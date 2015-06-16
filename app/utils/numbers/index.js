var T2W = require('./number2text');
var translator = new T2W('EN_US');
var yr2txt = require('./year2text');

function clean(num) {
  if (typeof(num) == 'number') return num;
  var s = '';
  for (var i = 0; i < num.length; i++) {
    var c = num.charAt(i);
    if (c.match(/[\d\.:]/))
      s += c;
  }
  return s;
}

exports.convert = function (type, num) {
  switch (type) {
    case 'DATE':
      return yr2txt(clean(num));
    case 'EVERY':
      return everyNumber(clean(num));
    case 'DOLLARS':
      var c = clean(num);
      var a = c.split('.');
      var d = parseInt(a[0]);
      var c = parseInt(a[1]);
      var s = n2t(a[0]) + " dollar" + ((d == 1) ? '' : 's');
      if (c > 0)
        s += " and " + n2t(a[1]) + " cent" + ((c == 1) ? '' : 's');
      return s;
    default:
      var c = clean(num);
      if (c.indexOf(':') != -1) {
        var a = c.split(':');
        var o = parseInt(a[1]) < 10 ? 'oh ' : '';
        return n2t(a[0]) + ' ' + o + n2t(a[1]);
      } else if (c.indexOf('.') != -1) {
        var a = c.split('.');
        return n2t(a[0]) + " point " + everyNumber(a[1]);
      }
      else
        return n2t(clean(num));
  }
}

function n2t(c) {
  var n = (typeof(c) == 'string') ? parseInt(c) : c;
  if (isNaN(n)) return c;
  try {
    return translator.toWords(n);
  } catch (e) {
    console.log('number err', c);
    return everyNumber(n);
  }
}

function everyNumber(n) {
  var x = '';
  var s = String(n);
  for (var i = 0; i < s.length; i++) {
    var c = n2t(s.charAt(i));
    if (i != 0 && c != '-')
      x += ' ';
    if (c == '-')
      x += ',';
    else
      x += c;
  }
  return x.trim();
}