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
//AIzaSyCqvRYeoVDM0rlFh3DhqEHsYwU7xAlEMsg
//cursor:null, key:'AIzaSyCoRa-naBDIOmwg71Q7WgqZQVv2XvvUmms'
freebase.list("/music/artist", {}, function (r) {
  console.log("!", r)
});

