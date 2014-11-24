var request = require('request');
var fs = require('fs');

var default_url = 'https://tts.nuancemobility.net:443/NMDPTTSCmdServlet/tts';
var default_key = 'appId=NMDPTRIAL_posttool20130924213420&appKey=168d9660fd1d7b01b1e07c625cb04a43a3fed407f099281fd51860fdbb9ab9d1274f31256cad261d8da280ea52ca2df5c901fdb99a25d8703d386df8d326c9fa';
var default_headers = {
  'Content-Type': 'text/plain',
  'Accept': 'audio/x-wav',
};


exports.render = function (text, output, voice, complete) {
  var file = fs.createWriteStream(output);
  request({
    url: default_url + '?' + default_key + '&id=57349abd2390&voice=' + voice,//&ttsLang=en_US',
    headers: default_headers,
    method: 'POST',
    body: text
  }).pipe(file).on('close', function () {
      complete();
  }).on('error', function (e) {
      complete(e)
  });

}