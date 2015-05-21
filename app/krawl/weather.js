var request = require('request');
var Stream = require('./filestream').Stream;

function discussion_for_state(state, out) {
  var url = "http://www.nws.noaa.gov/view/prodsByState.php?prodtype=discussion&state=";
  request({url: url + state}, function (err, res, body) {
    if (err) {
      console.dir(err)
      return
    }
    if (res.statusCode == 200)
      process(body, out);
    else
      console.log(":( " + res.statusCode);
  });
}

function process(body, out) {
  var reading = false;
  var section = null;
  var section_str = '';
  var lines = body.split("\n");

  function begin_section(line) {
    reading = true;
    section = line.substring(1);
    section_str = '';
    if (!out) {
      console.log('\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ ' + section);
    }
  }

  function end_section() {
    reading = false;
    if (section.indexOf('POINT TEMPS') != -1) {
      return;
    }
    if (!out) {
      console.log(section_str);
      console.log('////////////////////// END SECTION')
    } else {
      out.writeln(section_str);
      out.writeln('\n');
    }
  }

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line.indexOf('&&') == 0) {
      end_section();
      continue;
    }
    if (line.indexOf('.') == 0) {
      if (reading) {
        end_section();
        continue;
      }
      begin_section(line);
      continue;
    }
    if (reading) {
      if (line)
        section_str += line + ' ';
    }

  }
}


new Stream('data/weather.txt', function (out) {
  var STATES = ['CA', 'TX', 'MD', 'NY', 'AZ', 'FL', 'MN'];
  discussion_for_state(STATES[6], out);
});