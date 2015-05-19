var freebase = require('freebase');
var APIKEY = 'AIzaSyCoRa-naBDIOmwg71Q7WgqZQVv2XvvUmms';

var Stream = require('./filestream').Stream;

var outfile = 'data/teams.txt';
var query = [{
  "id": null,
  "name": null,
  "type": "/sports/sports_team",
  "location": [{
    "id": null,
    "name": null
  }],
  "limit": 100
}];

//var outfile = 'data/artists.txt';
//var query = [{
//  "id": null,
//  "name": null,
//  "type": "/music/artist",
//  "limit": 500
//}];

//var outfile = 'data/albums.txt';
//var query = [{
//  "id": null,
//  "name": null,
//  "type": "/music/album",
//  "limit": 500
//}];

//var outfile = 'data/books.txt';
//var query = [{
//  "id": null,
//  "name": null,
//  "type": "/book/book",
//  "/book/written_work/original_language": "English Language",
//  "limit": 500
//}];

//var outfile = 'data/holidays.txt';
//var query = [{
//  "id": null,
//  "name": null,
//  "type": "/time/holiday"
//}];

//var outfile = 'data/books-children-lit.txt';
//var query = [{
//  "id": null,
//  "name": null,
//  "type": "/book/book",
//  "/book/book/genre": "Children's literature",
//  "limit": 500
//}]


new Stream(outfile, function (stream) {

  var cursor = null;
  var ids = {};
  var c = 0;

  function next() {
    freebase.mqlread(query, {cursor: cursor, key: APIKEY}, function (r) {
      r.result.forEach(function (b) {
        if (!ids[b.id])
          ids[b.id] = 1;
        else {
          ids[b.id]++;
          console.log(b.id, ids[b.id])
          return;
        }
        if (b.name != null) {
          //console.log("* ",b);
          stream.writeln(b.name);
          c++;
        }
      })
      cursor = r.cursor;
      process.nextTick(next);
    });
  }
  next();
});


