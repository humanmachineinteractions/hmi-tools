var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var utils = require('../utils/index');
var exec = require('child_process').exec;
var model = require('./model');

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


PhoneDict.prototype.getTranscriptionInfo = function (sentence, complete) {
  var self = this;
  var unknown = [];
  var s = [];
  var phs = new model.SymbolList();
  var words = tokenize(sentence);
  utils.forEach(words, function (word, next) {
    if (!word) return next();
    if (word.match(model.NON_VOICED)) {
      s.push(word);
      phs.push(word);
      return next();
    } else {
      var WORD = word.toUpperCase();
      var lex_entry = self.entries[WORD];
      if (lex_entry) {
        s.push(lex_entry.getString(0));
        phs = phs.concat(lex_entry.get(0));
        phs.push('_');
        return next();
      } else {
        unknown.push(word);
        Phonesaurus.get_transcriptions(WORD, function (err, ss) {
          if (ss.length == 0) {
            console.log(">", WORD, ss);
            return next();
          }
          s.push(ss[0]);
          phs = phs.concat(ss[0].split(' '));
          phs.push('_');
          return next();
        })
      }
    }
  }, function () {
    complete(null, {text: sentence, transcription: s, phones: phs, unknown: unknown});
  });
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
  if (phones[0] == '')
    phones.shift();
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

PhoneDictEntry.prototype.getString = function (idx) {
  var ts = this.get(idx);
  if (!ts) return null;
  var s = '';
  ts.forEach(function (ss) {
    if (ss)
      s += ss + ' ';
  });
  return s.trim();
}

PhoneDictEntry.prototype.size = function () {
  return this.transcriptions.length;
}

/**
 * turns a sentence into an array of tokens (words and punctuation elements)
 * @param sentence
 * @returns {Array}
 */
function tokenize(sentence) {
  var st = sentence.split(' ');
  var words = [];
  st.forEach(function (s) {
    var m = s.match(model.NON_VOICED);
    if (m) {
      for (var i = 0; i < m.length; i++) {
        var c = m[i];
        var idx = s.indexOf(c);
        words.push(s.substring(0, idx));
        words.push(s.substring(idx, idx + c.length)); // punc
        s = s.substring(idx + c.length);
      }
    }
    if (s)
      words.push(s);
  });
  return words;
}

/**
 * Phonesaurus wrapper
 * @type {{BASE_DIR: (*|string), init: Function, get_transcriptions: Function, test: Function}}
 * @see https://github.com/AdolfVonKleist/Phonetisaurus
 */
var Phonesaurus = {
  BASE_DIR: process.env.PHONESAURUS_BASE || '/home/vagrant/Phonetisaurus/script',
  init: function () {
    exec('pgrep twistd', function (err, stdout, stderr) {
      if (!stdout) {
        console.log('twistd server starting');
        exec('/usr/bin/twistd -y g2pservice.tac', {cwd: Phonesaurus.BASE_DIR}, function (err, stdout, stderr) {
          if (err) console.error('error - is phonesaurus installed?', err, stdout, stderr);
          else {
            console.log('...server ready. to: kill -9 `pgrep twistd`');
            Phonesaurus.test();
          }
        });
      }
      else {
        console.log('twistd server ready');
        Phonesaurus.test();
      }
    });
  },
  get_transcriptions: function (t, complete) {
    t = t.replace("'", '');
    t = t.toUpperCase();
    exec(Phonesaurus.BASE_DIR + '/g2p-client.py -m app-id -w ' + t + ' -n 3', {cwd: Phonesaurus.BASE_DIR}, function (err, stdout, stderr) {
      //console.log(err, stdout, stderr);
      var r = [];
      var s = stdout.split('\n');
      s.forEach(function (u) {
        var v = u.split('\t');
        if (v.length == 2)
          r.push(v[1]);
      })
      complete(err, r);
    });
  },
  test: function () {
    Phonesaurus.get_transcriptions('Machine', function (err, r) {
      if (err) console.error('error', err)
      else console.log(r);
    });
  }
};
Phonesaurus.init();


exports = module.exports = PhoneDict;
