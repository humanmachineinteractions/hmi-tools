form_fields["annotator_field"] = function () {
  var self = this;
  var $el = $$("annotator").data("__obj__", self);
  var $cel = $$("annotator-controls").data("__obj__", self);
  self.$el = function () { return $el; };
  self.$cel = function () { return $cel; };
  var schema_fields = [];
  self.init = function(){
    self.form.add_listener('change', function(){
      update_ui();
    });

  };

  var _meta = {};
  Object.defineProperty(self, "data", {
    get: function () {
      return _meta;
    },
    set: function (n) {
      if (!n) n = {};
      _meta = n;
      update_ui();
    }
  });

  function update_ui(){
    $el.empty();
    if (_meta.nlp) {
      for (var i=0; i<_meta.nlp.length; i++){
        var n = _meta.nlp[i];
        var $d = $$("token");
        var $a = $$("word").text(n.word);
        var $p = $$("pos").text(n.pos);
        if (n.ne) {
          $p.append("<br>", n.ne);
        }
        $d.append($a, $p);
        $el.append($d);
      }
    }
  }

};
