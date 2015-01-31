var groove = require('groove');//https://github.com/andrewrk/libgroove
var assert = require('assert');
var fs = require('fs');

// add silence recordings to playlist

exports.convert = function (input, output, format, codec, sampleRate, cb) {

  var metadata = null;
  var duration = -1;
  groove.setLogging(groove.LOG_INFO);

  var playlist = groove.createPlaylist();
  var encoder = groove.createEncoder();
  console.log(encoder.targetAudioFormat)
  encoder.formatShortName = format;//"ogg";
  encoder.codecShortName = codec;//"vorbis";
  encoder.targetAudioFormat.sampleRate = sampleRate;
  encoder.targetAudioFormat.channelLayout = 1;
  encoder.targetAudioFormat.sampleFormat = '16-bit';
  //encoder->filename = output_file_name;
  //encoder->mime_type = mime;

  var outStream = fs.createWriteStream(output);

  encoder.on('buffer', function () {
    var buffer;
    while (buffer = encoder.getBuffer()) {
      if (buffer.buffer) {
        outStream.write(buffer.buffer);
      } else {
        cleanup();
        return;
      }
    }
  });

  encoder.attach(playlist, function (err) {
    assert.ifError(err);
    groove.open(input, function (err, file) {
      assert.ifError(err);
      metadata = file.metadata();
      duration = file.duration();
      playlist.insert(file, null);
    });
  });

  function cleanup() {
    var file = playlist.items()[0].file;
    playlist.clear();
    file.close(function (err) {
      assert.ifError(err);
      encoder.detach(function (err) {
        assert.ifError(err);
        cb(null, {duration: duration, metadata: metadata});
      });
    });
  }
}
