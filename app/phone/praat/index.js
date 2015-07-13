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

exports.TextGrid = praat_tg;