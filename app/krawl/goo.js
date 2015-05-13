var mongoose = require('mongoose');
var utils = require('../utils');

mongoose.connect('mongodb://localhost/hmi-domain-data');
var Dictionary = mongoose.model('Dictionary', {
  word: String,
  type: String,
  tags: [String],
  uses: Number,
  details: String,
  source: String
});

// places
var GooglePlaces = require('google-places');
var places = new GooglePlaces('AIzaSyCqvRYeoVDM0rlFh3DhqEHsYwU7xAlEMsg');

// pick a random city and search term
var cities = require('./cities');
var city = rnda(cities.US_CITIES);
var loc = [city[5], city[6]];
var kw = rnda(['food', 'store', 'yoga', 'beauty', 'clothing', 'park'])

places.search({keyword: kw, location: loc, radius: 5000}, function (err, response) {
  //console.log(err, response.results);
  utils.forEach(response.results, function (r1, n1) {
    places.details({reference: r1.reference}, function (err, r2) {
      //console.log();
      var locs = [];
      r2.result.address_components.forEach(function (a) {
        if (a.types.indexOf('route') != -1) {
          locs.push([a.long_name, 'street']);
        }
        if (a.types.indexOf('locality') != -1) {
          locs.push([a.long_name, 'city']);
        }
      });
      utils.forEach(locs, function (a, n0) {
        save_d(a[0], a[1], null, n0);
      }, function () {
        save_d(r2.result.name, 'establishment', r2.result.types, function (err, r) {
          //console.log(r2.result.name + " [" + r2.result.types + "]")
          //console.log(r2.result.vicinity);
          if (r2.result.reviews) {
            utils.forEach(r2.result.reviews, function (r3, n2) {
              save_d(r3.author_name, 'name', [], n2);
            }, n1);
          } else {
            n1();
          }
        });
      });
    });
  }, function () {
    console.log('done');
  });
});

function save_d(word, type, tags, complete) {
  Dictionary.findOne({word: word, type: type}, function (err, d) {
    if (err) return complete(err);
    if (d) {
      d.uses++;
      console.log(d);
      d.save(complete);
    } else {
      d = new Dictionary({word: word, type: type, tags: tags, uses: 1, source: 'google-places'});
      console.log(d);
      d.save(complete);
    }
  });
}

function rnd(a) {
  return Math.random() * a;
}
function rndf(a) {
  return Math.floor(rnd(a));
}
function rnda(A) {
  return A[rndf(A.length)];
}
function rndbtw(a, b) {
  return (Math.random() * (b - a)) + a;
}