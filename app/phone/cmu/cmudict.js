var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var utils = require('../utils');


/**
 * The wrapper for cmudict.0.7a
 * Emits a 'ready' event
 * @constructor
 */
function CmuDict() {
  var self = this;
  self.entries = {};
  self.numberOfEntries = 0;
  utils.readLines(__dirname + '/data/cmudict.0.7a', function (data) {
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
    // it must be a new entry
    var e = new CmuDictEntry(word, phones);
    self.entries[e.word] = e;
    self.numberOfEntries++;
  }, function () {
    self.emit('ready');
  });
}
CmuDict.prototype.__proto__ = EventEmitter.prototype;

CmuDict.prototype.getTranscription = function (sentence) {
  var words = sentence.split(" ");
  for (var i = 0; i < words.length; i++) {
    var word = removePunc(words[i]);
    var e = this.entries[word.toUpperCase()];
    if (e)
      console.log(e.word);
    else {
      var numbers = word.split(/[\:|\.|\']/);
      for (var n=0; n<numbers.length; n++) {
        var no = toWords(numbers[n]);
        if (no) {
          var nos = no.toUpperCase().split(" ");
          for (var m=0; m<nos.length; m++){
            console.log("*", "."+nos[m]+".", this.entries[nos[m]]);
          }
        } else {
          // etc... switching to mary
          console.log("DONT GET "+numbers[n]);
        }
      }
    }
  }
}


/**
 * wrapper for dict entries, collapsing multiple pronounciations
 * @param word
 * @param phones
 * @constructor
 */
function CmuDictEntry(word, phones) {
  this.word = word;
  this.transcriptions = [];
  this.add(phones);
}

CmuDictEntry.prototype.add = function (phones) {
  if (phones)
    this.transcriptions.push(phones);
}

CmuDictEntry.prototype.get = function (idx) {
  if (idx && this.transcriptions.length > idx)
    return this.transcriptions[idx];
  else if (this.transcriptions.length != 0)
    return this.transcriptions[0];
  else
    return null;
}

CmuDictEntry.prototype.size = function () {
  return this.transcriptions.length;
}



function removePunc(word) {
  return word.replace(/[\!|\.|\,|\?|\"]/g, "");
}


// American Numbering System
var th = ['','thousand','million', 'billion','trillion'];
// var th = ['','thousand','million', 'milliard','billion'];
var dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
var tn = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
var tw = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function toWords(s) {
  s = s.toString();
  s = s.replace(/[\, ]/g, '');
  if (s != parseFloat(s)) return null;//'not a number';
  var x = s.indexOf('.');
  if (x == -1) x = s.length;
  if (x > 15) return 'too big';
  var n = s.split('');
  var str = '';
  var sk = 0;
  for (var i = 0; i < x; i++) {
    if ((x - i) % 3 == 2) {
      if (n[i] == '1') {
        str += tn[Number(n[i + 1])] + ' ';
        i++;
        sk = 1;
      } else if (n[i] != 0) {
        str += tw[n[i] - 2] + ' ';
        sk = 1;
      }
    } else if (n[i] != 0) {
      str += dg[n[i]] + ' ';
      if ((x - i) % 3 == 0) str += 'hundred ';
      sk = 1;
    }
    if ((x - i) % 3 == 1) {
      if (sk) str += th[(x - i - 1) / 3] + ' ';
      sk = 0;
    }
  }
  if (x != s.length) {
    var y = s.length;
    str += 'point ';
    for (var i = x + 1; i < y; i++) str += dg[n[i]] + ' ';
  }
  return str.replace(/\s+/g, ' ');
}

// TEST

var d = new CmuDict();
d.on('ready', function () {
  console.log("Ready!");
  console.log(d.numberOfEntries);
//  for (var p in d.entries) {
//    var e = d.entries[p];
//    if (e.size()>3)
//      console.log(e);
//  }
  console.log(d.getTranscription("Different languages are, in fact, different, and I don't think there's an answer to the question you're asking. You could ask about specific languages, or what language would be best for that sort of manipulation. –  David Thornley Jun 17 '10 at 17:23"));
  console.log(d.getTranscription("We are the world's largest and most comprehensive directory and search engine for acronyms, abbreviations and initialisms on the Internet. Abbreviations.com holds hundreds of thousands of entries organized by a large variety of categories from computing and the Web to governmental, medicine and business and it is maintained and expanded by a large community of passionate editors. Read more about our awards and press coverage."));
  console.log(d.getTranscription("I have been using Netbeans for a while now, and I every now and then I discover new things, it is a very sophisticated piece of code that never ceases to amaze me."));
  console.log(d.getTranscription("Note: I always keep something like Sublime Text or Atom installed for quick editing, most of the time I don’t open Netbeans if it is only to edit a comma or to add a brake line."));
  console.log(d.getTranscription("Are you using Netbeans or another IDE? Share your experience in a comment!"));
})