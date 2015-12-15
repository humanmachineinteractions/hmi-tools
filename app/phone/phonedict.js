var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var utils = require('../utils/index');
var exec = require('child_process').exec;
var model = require('./model');
var numbers = require('../utils/numbers');

/**
 * The phonetic transcription dictionary.
 * Emits a 'ready' event
 * @constructor
 */
function PhoneDict(options, complete) {
  var self = this;
  self.entries = {};
  self.numberOfEntries = 0;
  self.phonesaurus = options ? options.phonesaurus != null ? options.phonesaurus : true : true;
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
    if (options && options.lex) {
      options.lex.forEach(function (le) {
        var e = new PhoneDictEntry(le.word, le.phones);
        self.entries[e.word] = e;
        self.numberOfEntries++;
      });
    }
    Phonesaurus.init(function () {
      self.emit('ready');
      if (complete)
        complete();
    });
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
  var wordInSentence;
  var nextNe = null;
  // if (sentence.charAt(0) == '[')
  //   sentence = JSON.parse(sentence);
  if (Array.isArray(sentence)) {
    wordInSentence = sentence;
  } else {
    sentence = sentence.replace(/’/, "'");
    wordInSentence = tokenize(/[ |–|—|\?|!|"|;|:|,|…|\(|)|“|”]/g, sentence);
  }
  utils.forEach(wordInSentence, function (wordInfo, next) {
    if (!wordInfo.word) return next();
    if (wordInfo.pos && wordInfo.pos.indexOf("-") != -1) return next();
    if (wordInfo.word.match(model.NON_VOICED)) {
      s.push(wordInfo.word);
      phs.push(wordInfo.word);
      return next();
    } else if (!wordInfo.ne && wordInfo.word.match(/\$/)) {
      nextNe = 'DOLLARS';
      process.nextTick(next);
      return;
    } else if (!wordInfo.ne && wordInfo.word.match(/#/)) {
      nextNe = 'EVERY';
      process.nextTick(next);
      return;
    } else {
      var words;
      if (wordInfo.word.match(/-?\d[\d,\.:]*/)) {
        words = tokenize(/[–|,]/g, numbers.convert(wordInfo.ne ? wordInfo.ne : nextNe, wordInfo.word));
        nextNe = null;
      } else {
        words = tokenize(/[\.|-]/g, wordInfo.word);
      }
      utils.forEach(words, function (word, next) {
        if (word.word.match(model.NON_VOICED)) {
          process.nextTick(next);
          return;
        }
        var WORD = word.word.toUpperCase();
        var lex_entry = self.entries[WORD];
        if (lex_entry) {
          s.push(lex_entry.getString(0));
          phs.push('_');
          phs = phs.concat(lex_entry.get(0));
          process.nextTick(next);
          return;
        } else {
          unknown.push(word.word);
          if (self.phonesaurus)
            Phonesaurus.get_transcriptions(WORD, function (err, ss) {
              if (ss.length == 0) {
                process.nextTick(next);
                return;
              }
              self.entries[WORD] = new PhoneDictEntry(WORD, ss[0].split(' '), true); // next time it will be 'cached' TODO improve this!
              s.push(ss[0]);
              phs.push('_');
              phs = phs.concat(ss[0].split(' '));
              process.nextTick(next);
              return;
            });
          else {
            process.nextTick(next);
            return;

          }
        }
      }, function () {
        process.nextTick(next);
        return;
      });
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
function PhoneDictEntry(word, phones, g2p) {
  this.word = word;
  this.transcriptions = [];
  this.g2p = g2p;
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
function tokenize(rg, sentence) {
  sentence = sentence.trim();
  var st = sentence.split(' ');
  var words = [];
  st.forEach(function (s) {
    if (!s.match(/\d/) && s.toUpperCase() == s) {
      for (var i = 0; i < s.length; i++) {
        words.push({word: s.charAt(i)});
      }
    } else {
      var m = s.match(rg);
      if (m) {
        for (var i = 0; i < m.length; i++) {
          var c = m[i];
          var idx = s.indexOf(c);
          words.push({word: s.substring(0, idx)});
          words.push({word: s.substring(idx, idx + c.length)}); // punc
          s = s.substring(idx + c.length);
        }
      }
      if (s)
        words.push({word: s});
    }
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
  init: function (ready) {
    exec('pgrep twistd', function (err, stdout, stderr) {
      if (!stdout) {
        console.log('phonesaurus server starting');
        exec('/usr/bin/twistd -y g2pservice.tac', {
          cwd: Phonesaurus.BASE_DIR,
          env: {LD_LIBRARY_PATH: '/usr/local/lib'}
        }, function (err, stdout, stderr) {
          if (err) {
            console.error('error - is phonesaurus installed?', err, stdout, stderr);
            ready(new Error('no phonesaurus'))
          }
          else {
            console.log('...server ready. to: kill -9 `pgrep twistd`');
            Phonesaurus.test(ready);
          }
        });
      }
      else {
        console.log('phonesaurus server ready');
        Phonesaurus.test(ready);
      }
    });
  },
  get_transcriptions: function (WORD, complete) {
    var t = WORD.replace("'", '');
    t = t.toUpperCase();
    exec(Phonesaurus.BASE_DIR + '/g2p-client.py -m app-id -w ' + t + ' -n 3', {
      cwd: Phonesaurus.BASE_DIR,
      env: {LD_LIBRARY_PATH: '/usr/local/lib'}
    }, function (err, stdout, stderr) {
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
  test: function (complete) {
    Phonesaurus.get_transcriptions('Machine', function (err, r) {
      if (err) console.error('error', err)
      else console.log(r);
      complete();
    });
  }
};


exports = module.exports = PhoneDict;
