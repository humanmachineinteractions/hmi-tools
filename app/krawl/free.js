var freebase = require('freebase');
var APIKEY = 'AIzaSyCoRa-naBDIOmwg71Q7WgqZQVv2XvvUmms';

var Stream = require('./filestream').Stream;

var query = [{
  "id": null,
  "type": "/film/film",
  "name": {
    "value": null,
    "lang": "/lang/en"
  },
  //"imdb_id": [],
  //"music": [],
  //"produced_by": [],
  //"starring": [{
  //  "actor": []
  //}],
  "limit": 100
}];


new Stream('data/films.txt', function (fstream) {
  new Stream('data/actors.txt', function (astream) {

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
          fstream.writeln(b.name.value);
          //b.starring.forEach(function (e) {
          //  astream.writeln(e.actor[0]);
          //});
          c++;
        });
        cursor = r.cursor;
        process.nextTick(next);
      });
    }

    next();
  });
});


//var outfile = 'data/teams.txt';
//var query = [{
//  "id": null,
//  "name": {
//    "value": null,
//    "lang": "/lang/en"
//  },
//  "type": "/sports/sports_team",
//  "location": [{
//    "id": null,
//    "name": null
//  }],
//  "limit": 100
//}];


// TODO get the track titles too
//var outfile = 'data/artists.txt';
//var query = [{
//  "id": null,
//  "name": null,
//  "type": "/music/artist",
//  "limit": 500
//}];


// SIMPLE
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


//new Stream(outfile, function (stream) {
//
//  var cursor = null;
//  var ids = {};
//  var c = 0;
//
//  function next() {
//    freebase.mqlread(query, {cursor: cursor, key: APIKEY}, function (r) {
//      r.result.forEach(function (b) {
//        if (!ids[b.id])
//          ids[b.id] = 1;
//        else {
//          ids[b.id]++;
//          console.log(b.id, ids[b.id])
//          return;
//        }
//        if (b.name != null) {
//          //console.log("* ",b);
//          stream.writeln(b.name);
//          c++;
//        }
//      })
//      cursor = r.cursor;
//      process.nextTick(next);
//    });
//  }
//  next();
//});


// TODO recipes

// TODO city, state