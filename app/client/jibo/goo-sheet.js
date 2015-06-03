var utils = require('../../utils/index');
var GoogleSpreadsheet = require("google-spreadsheet");
var Stream = require('../../krawl/filestream').Stream;

function doit(complete) {
  var C = 0;
  var my_sheet = new GoogleSpreadsheet('1C-xWDFYpjZMxorOkre372U4BzESAMOITbqhf7o3lyHc');
  my_sheet.getInfo(function (err, sheet_info) {
    if (err) return complete(err);
    utils.forEach(sheet_info.worksheets, function (sheet, next) {
      sheet.getRows(1, function (err, rows) {
        if (err) return complete(err);
        var speech_col_name = get_spcol(rows[0]);
        if (speech_col_name == null) {
          console.log('skipping ' + sheet.title + ' because i dont see a column title starting with "speech"...')
          return next();
        }
        new Stream(__dirname + '/data/' + sheet.title + '.txt', function (out) {
          console.log('writing ' + sheet.title + ' with ' + rows.length + ' rows');
          var c = 0;
          for (var i = 0; i < rows.length; i++) {
            var p = rows[i][speech_col_name];
            if (p) {
              C++;
              c++;
              out.writeln(p);
            }
          }
          out.end();
          next();
        });
      });
    }, function () {
      console.log("final sentence count=" + C);
      console.log('-');
      complete()
    });
  });
}

function get_spcol(row) {
  var speech_col_name = null;
  for (var p in row) {
    if (p.indexOf('speech') == 0) {
      speech_col_name = p;
      break;
    }
  }
  return speech_col_name;
}
function gen_scaf(complete) {
  var C = 0;
  var my_sheet = new GoogleSpreadsheet('1C-xWDFYpjZMxorOkre372U4BzESAMOITbqhf7o3lyHc');
  my_sheet.getInfo(function (err, sheet_info) {
    if (err) return complete(err);
    console.log('var M = {');
    utils.forEach(sheet_info.worksheets, function (sheet, next) {
      sheet.getRows(1, function (err, rows) {
        if (err) return complete(err);
        var speech_col_name = get_spcol(rows[0]);
        if (speech_col_name == null)
          return next();

        var c = 0;
        var MM = {};
        for (var i = 0; i < rows.length; i++) {
          var p = rows[i][speech_col_name];
          var ss = p;
          if (p) {
            C++;
            c++;
            var reg = /\[(.*?)]/g;
            var match = reg.exec(p);
            while (match != null) {
              var ms = match[0];
              if (!MM[ms])
                MM[ms] = p;
              match = reg.exec(p);
            }
          }
        }
        console.log('  ' + sheet.title.substring(6).toLowerCase() + ': [');
        for (var p in MM)
          console.log('    {exp: /\\' + p + '/g, values: []}, // '+MM[p]);
        console.log('  ],');
        next();
      });
    }, function () {
      console.log("}");
      console.log("final sentence count=" + C);
      console.log('-');
      complete()
    });
  });
}

gen_scaf(function (e) {
  console.log(e)
})
