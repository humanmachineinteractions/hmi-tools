var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var utils = require('../utils/index');


/**
 * The phonetic transcription dictionary.
 * Emits a 'ready' event
 * @constructor
 */
function PhoneDict() {
  var self = this;
  self.entries = {};
  self.numberOfEntries = 0;
  utils.readLines(__dirname + '/cmu/cmudict.0.7a', function (data) {
    if (data.indexOf(";;;") == 0 || data.indexOf("#") == 0)
      return;
    var s = data.split(" ");
    var word = s.shift();
    var phones = s;
    // is it an alternate pronounciation? indicated by WORD(3)
    var alt = word.search(/\(\d\)$/);
    if (alt != -1) {
      word = word.substring(0, alt);
      self.entries[word].add(phones);
      return;
    }
    // a new entry
    var e = new PhoneDictEntry(word, phones);
    self.entries[e.word] = e;
    self.numberOfEntries++;
  }, function () {
    self.emit('ready');
  });
}
PhoneDict.prototype.__proto__ = EventEmitter.prototype;

PhoneDict.prototype.getTranscription = function (sentence) {
  return this.getTranscriptionInfo(sentence).transcription;
}

PhoneDict.prototype.getTranscriptionInfo = function (sentence) {
  var unknown = [];
  var s = '';
  sentence = sentence.replace(/[-|–|—]/g, ' ');
  var words = sentence.split(' ');
  for (var i = 0; i < words.length; i++) {
    var word = removePunc(words[i]);
    var e = this.entries[word.toUpperCase()];
    if (e) {
      e.transcriptions[0].forEach(function (ss) {
        if (ss)
          s += ss + ' ';
      })
    }
    else {
      if (word) {
        unknown.push(word);
        s += '*' + word + '* ';
      }
    }
    if (i != words.length -1)
      s += '- ';
  }
  return {text: sentence, transcription: s, unknown: unknown};
}


/**
 * wrapper for dict entries, collapsing multiple pronounciations
 * @param word
 * @param phones
 * @constructor
 */
function PhoneDictEntry(word, phones) {
  this.word = word;
  this.transcriptions = [];
  this.add(phones);
}

PhoneDictEntry.prototype.add = function (phones) {
  if (phones)
    this.transcriptions.push(phones);
}

PhoneDictEntry.prototype.get = function (idx) {
  if (idx && this.transcriptions.length > idx)
    return this.transcriptions[idx];
  else if (this.transcriptions.length != 0)
    return this.transcriptions[0];
  else
    return null;
}

PhoneDictEntry.prototype.size = function () {
  return this.transcriptions.length;
}


function removePunc(word) {
  var p = word.replace(/[\.|\?|,|!|"|;|:|…]/gi, "");
  return p.trim();
}


exports = module.exports = PhoneDict;
