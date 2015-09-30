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
    var sdata = data[section];
    if (sdata) {
      var slen = sdata.length
      if (slen == 0) {
        console.log("TextGrid empty section:", section);
        return;
      }
      var sdatalen = sdata[0].length;
      if (sdatalen == 2) {
        s += '    item [' + (si + 1) + ']:\n';
        s += '        class = "TextTier" \n';
        s += '        name = "' + section + '" \n';
        s += '        xmin = 0 \n';
        s += '        xmax = ' + len + '\n';
        s += '        points: size = ' + sdata.length + '\n';
        sdata.forEach(function (line, li) {
          s += '        points [' + (li + 1) + ']:\n';
          s += '            number = ' + line[0] + '\n';
          s += '            mark = "' + line[1].trim() + '"\n';
        });
      } else if (sdatalen == 3 || sdata[0].text) {
        s += '    item [' + (si + 1) + ']:\n';
        s += '        class = "IntervalTier" \n';
        s += '        name = "' + section + '" \n';
        s += '        xmin = 0 \n';
        s += '        xmax = ' + len + '\n';
        s += '        intervals: size = ' + sdata.length + '\n';
        sdata.forEach(function (line, li) {
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