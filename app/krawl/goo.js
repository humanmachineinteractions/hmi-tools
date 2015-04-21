var GooglePlaces = require('google-places');

var places = new GooglePlaces('AIzaSyDL16by-fAL98Q8elWMyaAJPH83gX3gERY');

var loc = [rndbtw(24.396308, 49.384358), rndbtw(-124.848974, -66.885444)];

places.search({keyword: 'Food', location: loc, radius: 50000}, function (err, response) {
//  console.log(err, response);

  for (var x = 0; x < response.results.length; x++) {
    places.details({reference: response.results[x].reference}, function (err, r2) {
      console.log(r2.result.name + " [" + r2.result.types + "]")
      console.log(r2.result.vicinity);
      if (r2.result.reviews) {
        for (var i = 0; i < r2.result.reviews.length; i++) {
          var r = r2.result.reviews[i];
          console.log("  " + r.author_name);
        }
      }
    });
  }
});

function rndbtw(a, b) {
  return (Math.random() * (b - a)) + a;
}