var ProgressBar = require('progress');
var colors = require('colors');

function welcome() {
  console.log('|-| |_| |\\/| /\\ |\\|   |\\/| /\\ ( |-| | |\\| [-   | |\\| ~|~ [- /? /\\ ( ~|~ | () |\\| _\\~ '.red) ;
}
function log(s){
  console.log(s);
}

exports.ProgressBar = ProgressBar;
exports.welcome = welcome;
exports.log = log;