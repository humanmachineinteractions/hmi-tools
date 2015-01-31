var fs = require('fs');

//http://www.renevolution.com/how-to-install-ffmpeg-on-mac-os-x/
//brew install ffmpeg --with-fdk-aac --with-ffplay --with-freetype --with-frei0r --with-libass --with-libvo-aacenc --with-libvorbis --with-libvpx --with-opencore-amr --with-openjpeg --with-opus --with-rtmpdump --with-schroedinger --with-speex --with-theora --with-tools
var ffmpeg = require('fluent-ffmpeg');



//function convert_to_mp3(job, source, dest, done) {
//  console.log('converting to mp3', source);
//  var dir = cms.config.resourcePath;
//  new ffmpeg({source: dir + source})
//    .withAudioCodec('libmp3lame') // libmp3lame // libfdk_aac
//    .withAudioBitrate('64k') // :-) mp3 196k // 64k
//    .withAudioChannels(1) // :-o
//    .on('end', function () {
//      done();
//    })
//    .on('error', function (err) {
//      console.log('encode error: ' + err.message);
//      job.log('encode error: ' + err.message);
//      done(err);
//    })
//    .on('progress', function (progress) {
//      job.progress(progress.percent, 100);
//    })
//    .saveToFile(dir + dest);
//}

var rex = /size=\s*(\d*)kB time=(\d\d):(\d\d):(\d\d).(\d\d) /;
var k = 0;
var d = 0;
function convert_to_aac(source, dest, done) {
  new ffmpeg({source: source})
    .withAudioCodec('libfdk_aac') // libmp3lame // libfdk_aac
    .withAudioBitrate('32k') // :-) mp3 196k // 64k
    .withAudioChannels(1) // :-o
    .on('end', function (a,b) {
      var rr = b.substring(b.indexOf('size='));
      var mt = rr.match(rex);
      k += Number(mt[1]);
      var h = Number(mt[2]) * 60 * 60 * 1000;
      var m = Number(mt[3]) * 60 * 1000;
      var s = Number(mt[4]) * 1000;
      var q = Number(mt[5]) * 100;
      var t = h + m + s + q;
      d += t;
      console.log(mt[1]+"kb", "total", k+"kb", m+' min', d/60000+' min');
      done();
    })
    .on('error', function (err) {
      console.log('encode error: ' + err.message);
      //job.log('encode error: ' + err.message);
      done(err);
    })
    .on('progress', function (progress) {
      //job.progress(progress.percent, 100);
    })
    .saveToFile(dest);
}

function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function convert_dir(dir, dest_dir) {
  console.log(dir);
  fs.readdir(dir, function (err, files) {
    shuffle(files);
    var i = 0;
    function convert_one() {
      var file = files[i];
      convert_to_aac(dir + file, dest_dir + file + '.aac', function () {
        i++;
        convert_one();
      });
    }
    convert_one();
  });
}

convert_dir('/home/vagrant/zoe-readings/', '/home/vagrant/zoe-readings-1/');

//size=     245kB time=00:01:02.55 bitrate=  32.0kbits/s
