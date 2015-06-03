var fs = require('fs');

var names = require('../../corpus/names');
var books = require('../../corpus/books');
var datetime = require('../../corpus/datetime');
var cities = fs.readFileSync('../../corpus/data/city.txt').toString().split('\n');
var establishment = fs.readFileSync('../../corpus/data/establishment.txt').toString().split('\n');
var booksKid = fs.readFileSync('../../corpus/data/books-children-lit.txt').toString().split('\n');
var listItem = fs.readFileSync('./data/list.txt').toString().split('\n');
var measures = fs.readFileSync('./data/measure.txt').toString().split('\n');
var musicArtist = fs.readFileSync('./data/music.artist.txt').toString().split('\n');
var musicSong = fs.readFileSync('./data/music.song.txt').toString().split('\n');
var musicType = fs.readFileSync('./data/music.type.txt').toString().split('\n');
var sportsCities = fs.readFileSync('./data/sports.cities.txt').toString().split('\n');
var sportsTeams = fs.readFileSync('./data/sports.teams.txt').toString().split('\n');
var remindersAction = fs.readFileSync('./data/reminders.action.txt').toString().split('\n');

//{exp: /\[(familymember|familyname|babyname|julie)\.?]/, values: names.People},
//{exp: /\[petname]/, values: names.Pets},
//{exp: /\[story]/, values: books.Childrens},
//{exp: /\[(DAY|dayofweek)]/, values: datetime.DaysOfWeek},
//{exp: /\[HH:MM]/, f: generateTime}

var M = {
  be: [
    {exp: /\[familymember]/g, values: names.People},
    {exp: /\[familymember.]/g, values: names.People},
    {exp: /\[named entity]/g, values: names.People},
    {exp: /\[familymember-plural]/g, f: peoplePossesive},
    {exp: /\[familyname]/g, values: names.People},
    {exp: /\[HH:MM]/g, f: timeHHMM},
  ],
  messaging: [
    {exp: /\[familyname]/g, values: names.People},
    {exp: /\[familymember]/g, values: names.People},
    {exp: /\[TIME]/g, f: timeHHMM},
    {exp: /\[DAY]/g, values: datetime.DaysOfWeek},
    {exp: /\[names]/g, values: names.People},
  ],
  cameraman: [
    {exp: /\[familymember]/g, values: names.People},
  ],
  videoconferencing: [
    {exp: /\[familymember]/g, values: names.People},
    {exp: /\[DATE]/g, f: dateMMDD},
  ],
  storytelling: [
    {exp: /\[story]/g, values: booksKid},
    {exp: /\[julie]/g, values: names.People},
  ],
  homewatch: [
    {exp: /\[babyname]/g, values: names.People},
    {exp: /\[petname]/g, values: names.Pets},
    {exp: /\[familymember]/g, values: names.People},
  ],
  lists: [
    {exp: /\[List Item]/g, values: listItem},
  ],
  reminders: [
    {exp: /\[date\/time]/g, f: dateMMDD},
    {exp: /\[action]/g, values: remindersAction},
    {exp: /\[time]/g, f: timeHHMM},
    {exp: /\[reminder]/g, values: remindersAction},
    {exp: /\[currency]/g, f: currencyLow},
    {exp: /\[date]/g, f: dateMMDD},
    {exp: /\[curency]/g, f: currencyLow},
    {exp: /\[phone number]/g, f: phoneNumbers},
    {exp: /\[name]/g, values: names.People},
    {exp: /\[location]/g, values: cities},
    {exp: /\[address]/g, f: addresses},
  ],
  weather: [
    {exp: /\[cardinal 0-130]/g, f: cardinals0to130},
    {exp: /\[fifty five]/g, f: cardinals0to130},
    {exp: /\[two]/g, f: cardinals0to130},
    {exp: /\[cardinal]/g, f: cardinals0to130},
  ],
  kitchen: [
    {exp: /\[measurement]/g, values: measures},
    {exp: /\[ingredient names]/g, values: listItem},
    {exp: /\[cardinal]/g, f: cardinals0to130},
  ],
  music: [
    {exp: /\[Artist Name\/Music Type]/g, values: musicArtist},
    {exp: /\[Artist Name]/g, values: musicArtist},
    {exp: /\[Music Type]/g, values: musicType},
    {exp: /\[Song Name]/g, values: musicSong},
  ],
  sports: [
    {exp: /\[cardinal]/g, f: cardinals0to130},
    {exp: /\[sportsteam]/g, values: sportsTeams},
    {exp: /\[caridnal]/g, f: cardinals0to130},
    {exp: /\[cityname]/g, values: sportsCities},
  ],
  locations: [
    {exp: /\[Location]/g, values: establishment},
    {exp: /\[address]/g, f: addresses},
    {exp: /\[cardinal]/g, f: cardinals0to130},
    {exp: /\[locations]/g, values: cities},
    {exp: /\[distance]/g, f: distances},
    {exp: /\[time]/g, f: timeHHMM},
    {exp: /\[location]/g, values: establishment},
  ],
}

console.log(M);

var T2W = require('../../utils/numbers/number2text');
var translator = new T2W('EN_US');

function n2t(c) {
  return translator.toWords(c);
}

function cardinals0to130() {
  return cardinals(1, 130)
}

function dateMMDD() {

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
  return r;
}
function phoneNumbers() {
  var r = [];
  return r;
}
function addresses() {
  var r = [];
  return r;
}
function distances() {
  var r = [];
  // 3 miles, 3 blocks
  return r;
}
function peoplePossesive(){
  var r = [];
  for (var i=0; i<names.length; i++)
    r.push(names[i]+"'s");
  return r;
}
// utils


function cardinals(a, b) {
  var r = [];
  for (var i = a; i < b + 1; i++) {
    r.push(n2t(i));
  }
  return r;
}

function time(hr, min) {
  //if (random.yes(.05)) {
  //  return random.yes() ? 'midnight' : 'noon'; TODO
  //}
  //var hr = random.int(1, 12);
  //var min = random.int(0, 59);
  var s = translator.toWords(hr);
  s += ' ';
  if (min == 0)
    s += 'oclock';
  else if (min < 10)
    s += 'oh ' + translator.toWords(min);
  else
    s += translator.toWords(min);
  if (min != 0) {
    s += ' ';
    if (random.yes())
      s += 'pm';
    else
      s += 'am';
  }
  return s;
}
