var fs = require('fs');
var path = require('path');

//http://www.renevolution.com/how-to-install-ffmpeg-on-mac-os-x/
//brew install ffmpeg --with-fdk-aac --with-ffplay --with-freetype --with-frei0r --with-libass --with-libvo-aacenc --with-libvorbis --with-libvpx --with-opencore-amr --with-openjpeg --with-opus --with-rtmpdump --with-schroedinger --with-speex --with-theora --with-tools
var ffmpeg = require('fluent-ffmpeg');

function convert_to_mp3(source, dest, done) {
  convert([source], [dest], {audioCodec: 'libmp3lame', audioBitrate: '196k', audioChannels: 1}, done);
}

//function convert_to_av(source, dest, done) {
//  convert([source], [dest], {audioChannels: 1, audioFrequency: 22050}, done);
//}

function convert(sources, dests, options, done) {
  //console.log('convert', sources);
  var c = new ffmpeg();
  for (var i = 0; i < sources.length; i++)
    c.input(sources[i]);
  for (var p in options)
    c[p](options[p]);
  c.on('end', function (err, b) {
    if (err) return done(err);
    done(null, parseEnd(b));
  });
  c.on('error', function (err) {
    console.log('encode error: ' + err.message);
    done(err);
  });
  if (options.progress instanceof Function) {
    c.on('progress', function (progress) {
      options.progress(progress.percent);
    });
  }
  for (var i = 0; i < dests.length; i++)
    c.output(dests[i]);
  c.run();
}
exports.convert = convert;

var rex = /size=\s*(\d*)kB time=(\d\d):(\d\d):(\d\d).(\d\d) /;
function parseEnd(b) {
  var rr = b.substring(b.indexOf('size='));
  var mt = rr.match(rex);
  var k = Number(mt[1]);
  var h = Number(mt[2]) * 60 * 60 * 1000;
  var m = Number(mt[3]) * 60 * 1000;
  var s = Number(mt[4]) * 1000;
  var q = Number(mt[5]) * 100;
  var t = h + m + s + q;
  //console.log(mt[1] + "kb", "total", k + "kb", m + ' min', (t / 60000) + ' min');
  return {
    size: k, length: t
  };
}

function convert_dir(dir, dest_dir, name_options, convert_options, complete) {
  fs.readdir(dir, function (err, files) {
    function convert_one(i) {
      if (i >= files.length) {
        if (complete) complete();
        return;
      }
      var file = files[i];
      var fext = path.extname(file);
      if (fext != name_options.inputExt)
        return convert_one(++i);
      var fname = path.basename(file, fext);
      if (name_options.name instanceof Function)
        fname = name_options.name(fname);
      console.log(file)
      convert([dir + file], [dest_dir + fname + name_options.outputExt], convert_options, function (err, info) {
        convert_one(++i);
      });
    }

    convert_one(0);
  });
}
exports.convertDir = convert_dir;

