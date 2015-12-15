$(document).ready(function () {
  var baseurl = "http://localhost:4567";
  var sm = null;
  var wavesurfer = Object.create(WaveSurfer);
  var pregion = null, nextregion = null, pregion$ui = null;
  var uid = urlParams["uid"];
  var uid_match = uid.match(/(\w+)_(\d+)/);
  if (!uid || !uid_match) {
    throw new Error("Requires UID")
  }
  var dataset_spkr = uid_match[1];
  var line_number = uid_match[2];

  $.ajax({
    url: baseurl + "/view.json",
    data: {vid: urlParams['vid'], uid: urlParams['uid']}
  }).done(function (r) {
    sm = JSON.parse(r);
    initWavesurfer();
  }).error(function (e) {
    console.error(e);
  });

  function initWavesurfer() {
    wavesurfer.init({
      container: '#waveform',
      height: 200,
      minPxPerSec: 700,
      scrollParent: true,
      normalize: false,
      minimap: true
    });

    wavesurfer.initMinimap({
      height: 30,
      waveColor: '#ddd',
      progressColor: '#999',
      cursorColor: '#999'
    });

    wavesurfer.load(baseurl + '/wav?vid=' + urlParams['vid'] + '&uid=' + urlParams['uid']);

    wavesurfer.on('region-click', function (region, e) {
      e.stopPropagation();
      selectRegion(region, true);
    });

    wavesurfer.on('region-in', function (region, e) {
      selectRegion(region, false);
    });

    wavesurfer.on('finish', function (region, e) {
      nextregion = null;
    });

    wavesurfer.on('ready', function () {
      var timeline = Object.create(WaveSurfer.Timeline);
      timeline.init({
        wavesurfer: wavesurfer,
        container: "#wave-timeline"
      });
      addRegionsWords();
      displayOverview();
      nextregion = getSortedRegions()[0];
      $(document).keypress(function (e) {
        if (e.keyCode == 46) {
          if (nextregion)
            selectRegion(nextregion, true);
          else {
            var n = Number(line_number) + 1;
            var ns = "00000000000" + n;
            ns = ns.substring(ns.length - line_number.length);
            document.location.href = "view.html?vid=" + urlParams["vid"] + "&uid=" + dataset_spkr + "_" + ns;
          }
        } else if (e.keyCode == 32) {
          wavesurfer.play();
        }
      });
      $("#word").click(function () {
        pregion = null;
        addRegionsWords();
        nextregion = getSortedRegions()[0];
      });
      $("#syll").click(function () {
        pregion = null;
        addRegionsSyllables();
        nextregion = getSortedRegions()[0];
      });
      $("#ph").click(function () {
        pregion = null;
        addRegionsPhones();
        nextregion = getSortedRegions()[0];
      });
      $("#ins").click(function () {
        wavesurfer.addRegion({
          start: wavesurfer.getCurrentTime(),
          end: wavesurfer.getCurrentTime() + .2,
          color: color(200, 200, 200, .1),
          data: {syllables: [], text: ""}
        });
      })

    });
  }

  function color(r, g, b, alpha) {
    return 'rgba(' + [r, g, b, alpha || 1] + ')';
  }

  function addRegionsPhones() {
    wavesurfer.clearRegions();
    sm.document.paragraphs.forEach(function (paragraph) {
      paragraph.sentences.forEach(function (sentence) {
        sentence.phrases.forEach(function (phrase) {
          // boundary;
          phrase.words.forEach(function (word) {
            //depth, pos, text
            if (word.syllables) {
              word.syllables.forEach(function (syllable) {
                syllable.forEach(function (ph) {
                  var r = {
                    start: ph.begin,
                    end: ph.end,
                    color: color(200, 200, 200, .1),
                    data: ph
                  }
                  wavesurfer.addRegion(r);
                });
              });
            }
          });
        })
      })
    });
  }

  function addRegionsSyllables() {
    wavesurfer.clearRegions();
    sm.document.paragraphs.forEach(function (paragraph) {
      paragraph.sentences.forEach(function (sentence) {
        sentence.phrases.forEach(function (phrase) {
          // boundary;
          phrase.words.forEach(function (word) {
            //depth, pos, text
            if (word.syllables) {
              word.syllables.forEach(function (syllable) {
                var r = {
                  start: syllable[0].begin,
                  end: syllable[syllable.length - 1].end,
                  color: color(200, 200, 200, .1),
                  data: syllable
                };
                wavesurfer.addRegion(r);
              });
            }
          });
        })
      })
    });
  }

  function addRegionsWords() {
    wavesurfer.clearRegions();
    sm.document.paragraphs.forEach(function (paragraph) {
      paragraph.sentences.forEach(function (sentence) {
        sentence.phrases.forEach(function (phrase) {
          // boundary;
          phrase.words.forEach(function (word) {
            if (word.syllables) {
              var begin = 11111111, end = 0;
              word.syllables.forEach(function (syllable) {
                begin = Math.min(begin, syllable[0].begin)
                end = Math.max(end, syllable[syllable.length - 1].end)
              });
              var r = {
                start: begin,
                end: end,
                color: color(200, 200, 200, .1),
                data: word
              };
              wavesurfer.addRegion(r);
            }
          });
        })
      })
    });
  }

  function getPhs(syllables) {
    var s = "";
    for (var i = 0; i < syllables.length; i++) {
      var syll = syllables[i];
      for (var j = 0; j < syll.length; j++) {
        var ph = syll[j];
        s += (ph.text + " ");
      }
      if (i != syllables.length - 1)
        s += ("- ");
    }
    return s;
  }

  function getSortedRegions() {
    var rsort = [];
    for (var p in wavesurfer.regions.list) {
      rsort.push(wavesurfer.regions.list[p])
    }
    rsort.sort(function (a, b) {
      return a.end - b.end;
    });
    return rsort;
  }

  function getNext(region) {
    var rsort = getSortedRegions();
    for (var i = 0; i < rsort.length; i++) {
      var r = rsort[i];
      if (r.id == region.id && i != rsort.length - 1) {
        return rsort[i + 1];
      }
    }
    return null;
  }

  function getRegionAtTime(t) {
    var r = getSortedRegions();
    for (var i = 0; i < r.length; i++) {
      if (r[i].start >= t) {
        return r[i];
      }
    }
    return null;
  }

  function selectRegion(region, play) {
    nextregion = getNext(region);
    if (pregion)
      pregion.update({color: color(200, 200, 200, .1)})
    region.update({color: color(200, 200, 200, .6)});
    pregion = region;
    if (pregion$ui)
      pregion$ui.css({'background-color': '#fff'});
    if (region.data.$ui)
      region.data.$ui.css({'background-color': color(255, 255, 90, 1)});
    pregion$ui = region.data.$ui;
    displayRegion(region);
    if (play)
      region.play();
  }

  var $sel_info = $("#selection-info");

  function displayRegion(region) {
    //console.log(region)
    //console.log(region.data.$ui);
    $sel_info.empty();
    if (region.data.syllables) {
      //$sel_info.append("<div class='huge'>" + region.data.text + "</div>");
      var s = getPhs(region.data.syllables);
      $sel_info.append("<div class='huge'>" + s + "</div>");
    } else {
      $sel_info.append(JSON.stringify(region.data))
    }
  }

  var $ov_info = $("#overview-info");

  function displayOverview() {
    $ov_info.empty();
    sm.document.paragraphs.forEach(function (paragraph) {
      paragraph.sentences.forEach(function (sentence) {
        sentence.phrases.forEach(function (phrase) {
          // boundary;
          phrase.words.forEach(function (word) {
            if (word.syllables && word.syllables[0]) {
              var begin = word.syllables[0][0].begin;
              var r = getRegionAtTime(begin);
              // var $a = $("<span>" + JSON.stringify(word) + "</span>");//.addClass("medium");
              // r.data.$ui = $a;
              // $ov_info.append($a);
              // $ov_info.append(" ");
              // $a.click(function () {
              //   var r = getRegionAtTime(begin);
              //   r.data.$ui = $a;
              //   selectRegion(r, true);
              // });
            } else {
              var $a = $("<span><em>" + word.text + "</em></span>").addClass("medium");
              $ov_info.append($a);
              $ov_info.append(" ");
            }
          });
        });
      });
    });
  }


});
