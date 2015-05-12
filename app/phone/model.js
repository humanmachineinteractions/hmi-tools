var NON_VOICED = /[-|–|—|\.|\?|,|!|"|;|:|…]/;

/**
 *
 * @param ph
 * @param options
 * @constructor
 */
function Symbol(ph /*, options*/) {
  this.initial = ph;
  this.stressed = ph.match(/[0|1|2]$/) ? true : false;
  this.stress = this.stressed ? Number(ph.charAt(ph.length-1)) : 0;
  this.text = this.stressed ? ph.substring(0, ph.length - 1) : ph;
  this.voiced = ph.match(NON_VOICED) ? false : true;
}

exports.NON_VOICED = NON_VOICED;
exports.Symbol = Symbol;