form_fields["transcription_field"] = function () {
  var self = this;
  var $el = $$("transcriptionf").data("__obj__", self);
  var $cel = $$("transcription-controls").data("__obj__", self);
  self.$el = function () { return $el; };
  self.$cel = function () { return $cel; };
  self.init = function(){
    self.form.add_listener('change', function(){
      update_ui();
    });
  };

  var _t = "";
  Object.defineProperty(self, "data", {
    get: function () {
      return _t;
    },
    set: function (n) {
      if (!n) n = "";
      _t = n;
      update_ui();
    }
  });

  function update_ui(){
    $el.empty();
    var s = _t.split('  ');
    s.forEach(function(e){
      var $e = $$("word");
      $el.append($e);
      var ne = e.split(' ');
      ne.forEach(function(de){
        var last = de.length - 1;
        var $de = $$("ph", {el:'span'});
        if (de.indexOf('0') == last|| de.indexOf('1') == last || de.indexOf('2') == last) {
          var stress = de.substring(last, last + 1);
          de = de.substring(0, last);
          $de.addClass('stress-'+stress);
        }
        $de.text(de);
        $e.append($de);
      })
    })
  }

};
