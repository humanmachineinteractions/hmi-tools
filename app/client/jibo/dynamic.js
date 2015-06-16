var fs = require('fs');
var moment = require('moment');
var natural = require('natural'),
  nounInflector = new natural.NounInflector();

var names = require('../../corpus/names');
var books = require('../../corpus/books');
var datetime = require('../../corpus/datetime');
var cities = readList('../../corpus/data/geo.us.city.txt');
var states = readList('../../corpus/data/geo.us.state.txt');
var countries = readList('../../corpus/data/geo.country.txt');
var establishment = readList('../../corpus/data/establishment.edit.txt');
var booksKid = readList('../../corpus/data/books-children-lit.edit.txt');
var streets = readList('../../corpus/data/street.txt');
var listItem = readList('./data/list.txt');
var kitchenListItem = readList('./data/kitchen.list.txt');
var measures = readList('./data/measure.txt');
var musicArtist = readList('./data/music.artist.txt');
var musicSong = readList('./data/music.song.txt');
var musicType = readList('./data/music.type.txt');
var sportsCities = readList('./data/sports.cities.txt');
var sportsTeams = readList('./data/sports.teams.txt');
var remindersAction = readList('./data/reminders.action.txt');
var weatherConditions = readList('./data/weather.condition.txt');
var weatherConditioning = readList('./data/weather.conditioning.txt');
var weatherDirection = readList('./data/weather.direction.txt');
var chefs = readList('./data/chefs.txt');

//var T2W = require('../../utils/numbers/number2text');
//var translator = new T2W('EN_US');
//var dollars2text = require('../../utils/numbers/dollars2text');
var random = require('../../utils/random')

var special = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelvth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
var deca = ['twent', 'thirt', 'fourt', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

var MEASUREMENT = ['mile', 'block'];
var MEASUREMENTS = ['miles', 'blocks'];

var ROUTE_END = ['North', 'South', 'East', 'West'];
var ROUTE_BEGIN = ['Highway', 'Route'];

var VELOCITY = ['mile an hour', 'knot'];
var VELOCITIES = ['miles an hour', 'knots'];

var AMPM = ['AM', 'PM'];

var WEEKDAY = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

var M = {
  be: [
    {exp: /\[familymember]/, values: names.People},
    {exp: /\[familymember.]/, values: names.People},
    {exp: /\[named entity]/, values: names.People},
    {exp: /\[familymember\-plural]/, values: peoplePossesive()},
    {exp: /\[familyname]/, values: names.People},
    {exp: /\[names]/, values: names.People},
    {exp: /\[HH:MM]/, values: timeHHMM()},
  ],
  messaging: [
    {exp: /\[familyname]/, values: names.People},
    {exp: /\[familymember]/, values: names.People},
    {exp: /\[TIME]/, values: timeHHMM()},
    {exp: /\[DAY]/, values: datetime.DaysOfWeek},
    {exp: /\[names]/, values: names.People},
  ],
  cameraman: [
    {exp: /\[familymember]/, values: names.People},
  ],
  videoconferencing: [
    {exp: /\[familymember]/, values: names.People},
    {exp: /\[DATE]/, values: dateMMDD()},
  ],
  storytelling: [
    {exp: /\[story]/, values: booksKid},
    {exp: /\[julie]/, values: names.People},
    {exp: /\[cardinal 1-20]/, values: cardinals0to20()}
  ],
  homewatch: [
    {exp: /\[babyname]/, values: names.People},
    {exp: /\[petname]/, values: names.Pets},
    {exp: /\[familymember]/, values: names.People},
  ],
  lists: [
    {exp: /\[List Item]/, values: listItem},
  ],
  reminders: [
    {exp: /\[date\/time]/, values: dateMMDD()},
    {exp: /\[action]/, values: remindersAction},
    {exp: /\[time]/, values: timeHHMM()},
    {exp: /\[reminder]/, values: remindersAction},
    {exp: /\[currency]/, values: currencyLow()},
    {exp: /\[date]/, values: dateMMDD()},
    {exp: /\[curency]/, values: currencyLow()},
    {exp: /\[phone number]/, values: phoneNumbers()},
    {exp: /\[name]/, values: names.People},
    {exp: /\[location]/, values: cities},
    {exp: /\[address]/, values: addresses()},
    {exp: /\[familymember]/, values: names.People},
    {exp: /\[cardinal 1-20]/, values: cardinals(1, 20)},
    {exp: /\[city]/, values: cities},
    {exp: /\[weekday]/, values: WEEKDAY},
  ],
  weather: [
    {exp: /\[cardinal 0-130]/, values: cardinals(-50, 200)},
    {exp: /\[fifty five]/, values: cardinals(-50, 200)},
    {exp: /\[two]/, values: cardinals(-50, 200)},
    {exp: /\[cardinal]/, values: cardinals(0, 200)},
    {exp: /\[city]/, values: cities},
    {exp: /\[city\/state]/, values: cities},
    {exp: /\[cardinal (- )?up t[o|p] 130]/, values: cardinals(-50, 200)},
    {exp: /\[date]/, values: dateMMDD()},
    {exp: /\[date]/, values: timeHHMM()},
    {exp: /\[today\/tomorrow\/date]/, values: dateTTMMDD()},
    {exp: /\[location]/, values: cities},
    {exp: /\[rain\/snow]/, values: weatherConditions},
    {exp: /\[condition]/, values: weatherConditions},
    {exp: /\[condition-ing]/, values: weatherConditioning},
    {exp: /\[temp]/, values: temps()},
    {exp: /\[route]/, values: routes()},
    {exp: /\[direction]/, values: weatherDirection},
    {exp: /\[velocity]/, values: velocities()},
    {exp: /\[date\/year]/, values: dateMMDD()},
    {exp: /\[time]/, values: timeHHMM()},
  ],
  kitchen: [
    {exp: /\[measurement]/, values: measures},
    {exp: /\[ingredient names]/, values: kitchenListItem},
    {exp: /\[cardinal]/, values: cardinals0to130()},
    {exp: /\[author]/, values: chefs},
    {exp: /\[Author]/, values: chefs},
  ],
  music: [
    {exp: /\[Artist Name\/Music Type]/, values: musicArtist},
    {exp: /\[Artist Name]/, values: musicArtist},
    {exp: /\[artist]/, values: musicArtist},
    {exp: /\[Music Type]/, values: musicType},
    {exp: /\[music]/, values: musicType},
    {exp: /\[Song Name]/, values: musicSong},
    {exp: /\[song]/, values: musicSong},
    {exp: /\[name]/, values: names.People},
  ],
  sports: [
    {exp: /\[cardinal]/, values: cardinals0to130()},
    {exp: /\[sportsteam]/, values: sportsTeams},
    {exp: /\[caridnal]/, values: cardinals0to130()},
    {exp: /\[cityname]/, values: sportsCities},
  ],
  locations: [
    {exp: /\[Location]/, values: establishment},
    {exp: /\[location]/, values: establishment},
    {exp: /\[locations]/, values: pluralize(establishment)},
    {exp: /\[address]/, values: addresses()},
    {exp: /\[cardinal]/, values: cardinals0to130()},
    {exp: /\[cardinal 1-20]/, values: cardinals(1, 20)},
    {exp: /\[city]/, values: cities},
    {exp: /\[Country]/, values: countries},
    {exp: /\[country]/, values: countries},
    {exp: /\[state]/, values: states},
    {exp: /\[distance]/, values: distances()},
    {exp: /\[time]/, values: timeHHMM()},

  ],
  entertainment: []
}

module.exports = exports = M;


//
function readList(f) {
  var s = fs.readFileSync(f).toString().split('\n');
  var r = [];
  for (var i = 0; i < s.length && i < 1000; i++) {
    if (s[i])
      r.push(s[i].trim());
  }
  return r;
}
//function n2t(c) {
//  var n = (typeof(c) == 'string') ? parseInt(c) : c;
//  if (isNaN(n)) return c;
//  return translator.toWords(n);
//}

function cardinals0to130() {
  return cardinals(1, 130)
}

function cardinals0to20() {
  return cardinals(0, 20)
}
function ordinal(n) {
  if (n < 20) return special[n];
  if (n % 10 === 0) return deca[Math.floor(n / 10) - 2] + 'ieth';
  return deca[Math.floor(n / 10) - 2] + 'y-' + special[n % 10];
}

function dateMMDD() {
  var r = [];
  for (var m = 0; m < 12; m++) {
    for (var d = 0; d < 31; d++) {
      r.push(datetime.Months[m] + ' ' + ordinal(d));
    }
  }
  return r;
}

function dateTTMMDD() {
  return dateMMDD().concat(['today', 'tomorrow']);
}

function timeHHMM() {
  var r = [];
  for (var a = 0; a < 2; a++) {
    for (var h = 1; h < 13; h++) {
      for (var m = 0; m < 60; m++) {
        r.push(time(h, m) + ' ' + AMPM[a]);
      }
    }
  }
  return r;
}
function currencyLow() {
  var r = [];
  for (var d = 1; d < 100; d++) {
    for (var c = 0; c < 99; c++) {
      //r.push(dollars2text(d + '.' + c));
      r.push('$ ' + d + '.' + twodig(c));
    }
  }
  return r;
}
function phoneNumbers() {
  console.log('generating phone numbers')
  var r = [];
  var acc = random.int(33, 75);
  for (var ac = 210; ac < 980; ac += acc) {
    var fc = random.int(33, 76);
    for (var f = 230; f < 930; f += fc) {
      var lc = random.int(33, 76);
      for (var l = 1001; l < 9998; l += lc) {
        var s = ac + '-' + f + '-' + l;
        //var sl = s.length - 4;
        //var x = everyNumber(s.substring(0, sl)) + ' ';
        //x += twodig(s.substr(sl, 2)) + ' ';
        //x += twodig(s.substr(sl + 2, 2));
        r.push(s);
      }
    }
  }
  return r;
}
function addresses() {
  console.log('generating addresses')
  var r = [];
  for (var i = 0; i < streets.length && i < 1777; i++) {
    var street = streets[i].toString();
    if (street.match(/\d+/))
      continue;
    var ac = random.int(1999, 3999);
    for (var addr = random.int(1, 300); addr < 9999; addr += ac) {
      r.push(addr + ' ' + street);
    }
  }
  return r;
}
function distances() {
  var r = [];
  for (var i = 0; i < MEASUREMENT.length; i++) {
    for (var n = 1; n < 30; n++) {
      if (n == 1)
        r.push(n + ' ' + MEASUREMENT[i])
      else
        r.push(n + ' ' + MEASUREMENTS[i])
    }
  }
  return r;
}
function peoplePossesive() {
  var r = [];
  for (var i = 0; i < names.People.length; i++)
    if (names.People[i])
      r.push(names.People[i] + "'s");
  return r;
}
// utils
function cardinals(a, b) {
  var r = [];
  for (var i = a; i < b + 1; i++) {
    r.push(i);
  }
  return r;
}
function twodig(n) {
  n = typeof(n) == 'string' ? parseInt(n) : n;
  if (n < 10)
    return '0' + n;
  else
    return n;
}
function time(hr, min) {
  var s = hr;
  s += ':';
  s += twodig(min);
  return s;
}
function temps() {
  var r = [];
  var a = -50;
  var b = 200;
  for (var i = a; i < b; i++) {
    r.push(temp(i));
  }
  return r;
}
function temp(d) {
  return d + ' degrees';
}
function velocities() {
  var r = [];
  for (var i = 0; i < VELOCITY.length; i++) {
    for (var a = 1; a < 55; a++) {
      if (a == 1)
        r.push(a + ' ' + VELOCITY[i]);
      else
        r.push(a + ' ' + VELOCITIES[i]);
    }
  }
  return r;
}
function routes() {
  var r = [];
  for (var i = 0; i < ROUTE_END.length; i++) {
    var ac = random.int(22, 400);
    for (var addr = random.int(1, 20); addr < 2999; addr += ac) {
      r.push(addr + ' ' + ROUTE_END[i]);
    }
  }
  for (var i = 0; i < ROUTE_BEGIN.length; i++) {
    var ac = random.int(22, 400);
    for (var addr = random.int(1, 20); addr < 2999; addr += ac) {
      r.push(ROUTE_BEGIN[i] + ' ' + addr);
    }
  }
  return r;
}
function pluralize(words) {
  var r = [];
  words.forEach(function (w) {
    r.push(nounInflector.pluralize(w))
  });
  return r;
}
