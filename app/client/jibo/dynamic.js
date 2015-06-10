var fs = require('fs');
var moment = require('moment');

var names = require('../../corpus/names');
var books = require('../../corpus/books');
var datetime = require('../../corpus/datetime');
var cities = readList('../../corpus/data/city.txt');
var establishment = readList('../../corpus/data/establishment.edit.txt');
var booksKid = readList('../../corpus/data/books-children-lit.edit.txt');
var streets = readList('../../corpus/data/street.txt');
var listItem = readList('./data/list.txt');
var measures = readList('./data/measure.txt');
var musicArtist = readList('./data/music.artist.txt');
var musicSong = readList('./data/music.song.txt');
var musicType = readList('./data/music.type.txt');
var sportsCities = readList('./data/sports.cities.txt');
var sportsTeams = readList('./data/sports.teams.txt');
var remindersAction = readList('./data/reminders.action.txt');
var chefs = readList('./data/chefs.txt');

//var T2W = require('../../utils/numbers/number2text');
//var translator = new T2W('EN_US');
//var dollars2text = require('../../utils/numbers/dollars2text');
var random = require('../../utils/random')

var special = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelvth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
var deca = ['twent', 'thirt', 'fourt', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];
var MMM = ['miles', 'blocks']

var M = {
  be: [
    {exp: /\[familymember]/, values: names.People},
    {exp: /\[familymember.]/, values: names.People},
    {exp: /\[named entity]/, values: names.People},
    {exp: /\[familymember\-plural]/, values: peoplePossesive()},
    {exp: /\[familyname]/, values: names.People},
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
  ],
  weather: [
    {exp: /\[cardinal 0-130]/, values: cardinals0to130()},
    {exp: /\[fifty five]/, values: cardinals0to130()},
    {exp: /\[two]/, values: cardinals0to130()},
    {exp: /\[cardinal]/, values: cardinals0to130()},
    {exp: /\[city]/, values: cities},
    {exp: /\[cardinal - up to 130]/, values: cardinals0to130()}
  ],
  kitchen: [
    {exp: /\[measurement]/, values: measures},
    {exp: /\[ingredient names]/, values: listItem},
    {exp: /\[cardinal]/, values: cardinals0to130()},
    {exp: /\[author]/, values: chefs},
    {exp: /\[Author]/, values: chefs},
  ],
  music: [
    {exp: /\[Artist Name\/Music Type]/, values: musicArtist},
    {exp: /\[Artist Name]/, values: musicArtist},
    {exp: /\[Music Type]/, values: musicType},
    {exp: /\[Song Name]/, values: musicSong},
  ],
  sports: [
    {exp: /\[cardinal]/, values: cardinals0to130()},
    {exp: /\[sportsteam]/, values: sportsTeams},
    {exp: /\[caridnal]/, values: cardinals0to130()},
    {exp: /\[cityname]/, values: sportsCities},
  ],
  locations: [
    {exp: /\[Location]/, values: establishment},
    {exp: /\[address]/, values: addresses()},
    {exp: /\[cardinal]/, values: cardinals0to130()},
    {exp: /\[city]/, values: cities},
    {exp: /\[distance]/, values: distances()},
    {exp: /\[time]/, values: timeHHMM()},
    {exp: /\[location]/, values: establishment},
  ],
}

module.exports = exports = M;


//
function readList(f) {
  return fs.readFileSync(f).toString().split('\n');
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
function timeHHMM() {
  var r = [];
  for (var h = 1; h < 13; h++) {
    for (var m = 0; m < 60; m++) {
      r.push(time(h, m));
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
        var s = '# ' + ac + '-' + f + '-' + l;
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
  for (var i = 0; i < MMM.length; i++) {
    for (var n = 1; n < 30; n++) {
      r.push(n + ' ' + MMM[i])
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
    //r.push(n2t(i));
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

//function everyNumber(n) {
//  var x = '';
//  var s = String(n);
//  for (var i = 0; i < s.length; i++) {
//    var c = n2t(s.charAt(i));
//    if (i != 0 && c != ',')
//      x += ' ';
//    x += c;
//  }
//  return x.trim();
//}
