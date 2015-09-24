function praat_tg(len, sections, data) {
  var s = 'File type = "ooTextFile"\n';
  s += 'Object class = "TextGrid"\n';
  s += '\n';
  s += 'xmin = 0 \n';
  s += 'xmax = ' + len + ' \n';
  s += 'tiers? <exists> \n';
  s += 'size = ' + sections.length + ' \n';
  s += 'item []: \n';
  sections.forEach(function (section, si) {
    if (data[section]) {
      s += '    item [' + (si + 1) + ']:\n';
      s += '        class = "IntervalTier" \n';
      s += '        name = "' + section + '" \n';
      s += '        xmin = 0 \n';
      s += '        xmax = ' + len + '\n';
      s += '        intervals: size = ' + data[section].length + '\n';
      data[section].forEach(function (line, li) {
        if (line.text && line.xmin && line.xmax) {
        s += '        intervals [' + (li + 1) + ']:\n';
        s += '            xmin = ' + line.xmin + '\n';
        s += '            xmax = ' + line.xmax + '\n';
        s += '            text = ' + line.text + '\n';
        } else {
        s += '        intervals [' + (li + 1) + ']:\n';
        s += '            xmin = ' + line[0] + '\n';
        s += '            xmax = ' + line[1] + '\n';
        s += '            text = "' + line[2].trim() + '"\n';
          }
      });
    }
  });
  return s;
}

var fs = require('fs');
var PR_INIT = 0;
var PR_ITEM = 1;
var PR_INTERVALS = 2;
function praat_read_tg(file, enc) {
  var o = {encoding: enc ? enc : "utf8"};
  var s = fs.readFileSync(file, o).toString().split('\n');
  var state = PR_INIT;
  var data = {};
  var sections = [];
  var section = null;
  var current_line = null;
  for (var i = 0; i < s.length; i++) {
    var tg_line = s[i].trim();
    if (tg_line.indexOf(" = ") != -1) {
      var nv = tg_line.split(" = ");
      switch (state) {
        case PR_INIT:
          break
        case PR_ITEM:
          if (nv[0] == "name") {
            section = nv[1].substring(1, nv[1].length - 1);
            sections.push(section);
            data[section] = [];
          }
          break;
        case PR_INTERVALS:
          current_line[nv[0]] = nv[1];
      }
    } else if (tg_line.match(/(\w+) \[(\d+)]:/)) {
      var nv = tg_line.split(" [");
      var n = nv[0];
      if (n == "item") {
        state = PR_ITEM;
      } else if (n == "intervals") {
        state = PR_INTERVALS;
        current_line = {}
        data[section].push(current_line);
      }
    }
  }
  data._items = sections;
  data._txt = s;
  return data;
}

exports.TextGrid = praat_tg;
exports.readTextGrid = praat_read_tg;