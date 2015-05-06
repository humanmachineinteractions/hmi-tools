var freebase = require('freebase');

//freebase.topic('books', {}, function(r){
//  console.log(r);
//})
//
//var query = [{
//  "type": "/astronomy/planet",
//  "name": null,
//  "/book/book_subject/works": []
//}]
//freebase.mqlread(query, {}, function (r) {
//  console.log("*",r)
//});
//
//


//freebase.related("gumby", {}, function (r) {
//  console.log("!", r.map(function (v) {
//    return v.name
//  }))
//});


//freebase.list("/book/book", {}, function (r) {
//  console.log("!", r)
//});

freebase.list("/music/artist", {cursor:null, key:'AIzaSyCoRa-naBDIOmwg71Q7WgqZQVv2XvvUmms'}, function (r) {
  console.log("!", r.length)
});

