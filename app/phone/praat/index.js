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
        s += '        intervals [' + (li + 1) + ']:\n';
        s += '            xmin = ' + line[0] + ' \n';
        s += '            xmax = ' + line[1] + '\n';
        s += '            text = "' + line[2].trim() + '" \n';
      });
    }
  });
  return s;
}

var fs = require('fs');
var PR_INIT = 0;
var PR_ITEM = 1;
var PR_INTERVALS = 2;
function praat_read_tg(file) {
  var s = fs.readFileSync(file).toString().split('\n');
  var state = PR_INIT;
  var data = {};
  var sections = [];
  var section = null;
  var current_line = null;
  s.forEach(function (tg_line) {
    tg_line = tg_line.trim();
    if (tg_line.indexOf(" = ") != -1) {
      var nv = tg_line.split(" = ");
      switch (state) {
        case PR_INIT:
          break
        case PR_ITEM:
          if (nv[0] == "name") {
            section = nv[1].substring(1, nv[1].length-1);
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
  });
  data._items = sections;
  return data;
}

exports.TextGrid = praat_tg;
exports.readTextGrid = praat_read_tg;