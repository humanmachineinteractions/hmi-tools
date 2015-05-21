var fs = require('fs');
var utils = require('../utils');
var random = require('../utils/random');
//var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/hmi-domain-data');
//var Dictionary = require('../dictionary').Dictionary;


// places
var GooglePlaces = require('google-places');
var places = new GooglePlaces('AIzaSyCqvRYeoVDM0rlFh3DhqEHsYwU7xAlEMsg');

// pick a random city and search term
var uscities = require('./data/cities');

var Stream = require('./filestream').Stream;

new Stream('data/city.txt', function (cities) {
  new Stream('data/street.txt', function (streets) {
    new Stream('data/name.txt', function (names) {
      new Stream('data/establishment.txt', function (establishments) {
        var f = function () {
          search(cities, streets, names, establishments, f)
        };
        f();
      });
    });
  });
})

function search(cities, streets, names, establishments, complete) {
  var city = random.oneOf(uscities.US_CITIES);
  var loc = [city[5], city[6]];
  var kw = random.oneOf(['food', 'store', 'yoga', 'beauty', 'clothing', 'park'])

  places.search({keyword: kw, location: loc, radius: 5000}, function (err, response) {
    //console.log(err, response.results);
    utils.forEach(response.results, function (r1, n1) {
      places.details({reference: r1.reference}, function (err, r2) {
        //console.log();
        r2.result.address_components.forEach(function (a) {
          if (a.types.indexOf('route') != -1) {
            streets.writeln(a.long_name);
          }
          if (a.types.indexOf('locality') != -1) {
            cities.writeln(a.long_name);
          }
        });

        establishments.writeln(r2.result.name);
        //console.log(r2.result.name + " [" + r2.result.types + "]")
        //console.log(r2.result.vicinity);
        if (r2.result.reviews) {
          utils.forEach(r2.result.reviews, function (r3, n2) {
            names.writeln(r3.author_name);
            n2();
          }, n1);
        } else {
          n1();
        }
      });
    }, function () {
      console.log('-----------------------');
      complete();
    });
  });
}




//function save_d(word, type, tags, complete) {
//  Dictionary.findOne({word: word, type: type}, function (err, d) {
//    if (err) return complete(err);
//    if (d) {
//      d.uses++;
//      console.log(d);
//      d.save(complete);
//    } else {
//      d = new Dictionary({word: word, type: type, tags: tags, uses: 1});
//      console.log(d);
//      d.save(complete);
//    }
//  });
//}

