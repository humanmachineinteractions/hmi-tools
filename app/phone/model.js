var NON_VOICED = /[-|–|—|\.|\?|,|!|"|;|:|…]/;

/**
 * Reprepsents an individual phone or unvoiced symbol.
 * @param ph
 * @param options
 * @constructor
 */
function Symbol(ph /*, options*/) {
  this.initial = ph;
  this.stressed = ph.match(/[0|1|2]$/) ? true : false;
  this.stress = this.stressed ? Number(ph.charAt(ph.length - 1)) : 0;
  this.text = this.stressed ? ph.substring(0, ph.length - 1) : ph;
  this.voiced = ph.match(NON_VOICED) ? false : true;
}

Symbol.prototype.toObject = function () {
  var o = {
    ph: this.text
  }
  if (this.stressed)
    o.stress = this.stress;
  return o;
};


/**
 *
 * @param type
 * @constructor
 */
function SymbolList(type) {
  this.type = type;
  this.list = [];
}

/**
 * push a Symbol
 * @param s {Symbol}
 */
SymbolList.prototype.push = function (s) {
  if (typeof(s) == 'string')
    this.list.push(new Symbol(s));
  else if (s instanceof Symbol)
    this.list.push(s);
  else
    throw new Error('only symbols '+typeof(s));
};

/**
 * Concatenate
 * @param a
 */
SymbolList.prototype.concat = function (a) {
  var self = this;
  a.forEach(function (s) {
    self.push(s);
  });
  return self;
};

/**
 * Get 1
 * @param idx
 * @returns {Symbol}
 */
SymbolList.prototype.get = function (idx) {
  return this.list[idx];
};

/**
 * Convenience forEach wrapper
 * @param f
 */
SymbolList.prototype.forEach = function (f) {
  this.list.forEach(f);
};

/**
 * Get the voiced symbols
 * @returns {SymbolList}
 */
SymbolList.prototype.voiced = function () {
  var v = new SymbolList(this.type);
  this.forEach(function (s) {
    if (s.voiced)
      v.push(s);
  });
  return v;
};

/**
 * needs options
 * @returns {string}
 */
SymbolList.prototype.toString = function () {
  var v = '';
  this.forEach(function(s){
    v += s.initial + ' ';
  });
  return v;
};

SymbolList.prototype.toObject = function () {
  var l = [];
  this.list.forEach(function(s){
    l.push(s.toObject())
  });
  return {
    type: this.type,
    list: l
  }
};

SymbolList.prototype.toJSON = function () {
  return JSON.stringify(this.toObject());
}

exports.NON_VOICED = NON_VOICED;
exports.Symbol = Symbol;
exports.SymbolList = SymbolList;