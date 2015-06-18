function findLines(phs, lines) {
  var r = [];
  lines.forEach(function (line) {
    var ll = line.split('\t');
    if (ll.length > 1) {
      var lphs = ll[1].split(' ');
      var idx = -1;
      for (var i = 0; i < lphs.length - phs.length + 1; i++) {
        var f = true;
        for (var j = 0; j < phs.length; j++) {
          var l = lphs[i + j];
          if (l.match(/..(\d)/))
            l = l.substring(0, 2);
          if (l != phs[j]) {
            f = false;
            break;
          }
        }
        if (f) {
          idx = i;
          break;
        }
      }
      if (idx != -1) {
        r.push(line);
      }
    }
  });
  return r;
}


function findPhones(phs, line, text) {
  var idx = -1;
  for (var i = 0; i < line.length - phs.length + 1; i++) {
    var f = true;
    for (var j = 0; j < phs.length; j++) {
      var l = line[i + j];
      if (l.match(/..(\d)/))
        l = l.substring(0, 2);
      if (l != phs[j]) {
        f = false;
        break;
      }
    }
    if (f) {
      idx = i;
      break;
    }
  }
  var sidx = -1;
  var sidxf = false;
  var s = '';
  for (var i = 0; i < line.length; i++) {
    var ph = line[i];
    if (ph == '_') {
      ph = ' ';
      if (!sidxf)
        sidx++;
    }
    if (i >= idx && i < idx + phs.length) {
      sidxf = true;
      s += ph.green;
    }
    else
      s += ph.grey;

  }
  var s2 = text.split(' ');
  var ss = '';
  for (var i = 0; i < s2.length; i++) {
    if (i == sidx)
      ss += s2[i].green;
    else
      ss += s2[i].white;
    ss += ' ';
  }
  return (ss + '\n ' + s);
}



exports.findPhones = findPhones;
exports.findLines = findLines;
