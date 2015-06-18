var ProgressBar = require('progress');
var colors = require('colors');

function welcome0() {
  log('|-| |_| |\\/| /\\ |\\|   |\\/| /\\ ( |-| | |\\| [-   | |\\| ~|~ [- /? /\\ ( ~|~ | () |\\| _\\~ '.green);
}
function welcome(message) {
  log('\
888 888     e   e     888 \n\
888 888    d8b d8b    888 \n\
8888888   e Y8b Y8b   888 \n\
888 888  d8b Y8b Y8b  888 \n\
888 888 d888b Y8b Y8b 888'.green);
  if (message)
    log(message.toUpperCase().blue);
}
function log(s) {
  console.log(s);
}

exports.ProgressBar = ProgressBar;
exports.welcome = welcome;
exports.log = log;