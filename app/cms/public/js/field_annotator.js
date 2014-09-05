form_fields["annotator_field"] = function () {
  console.log("LOADED annotator field")
  var self = this;
  var $el = $$("annotator").data("__obj__", self);
  var $cel = $$("annotator-controls").data("__obj__", self);
  self.$el = function () { return $el; };
  self.$cel = function () { return $cel; };
  self.init = function(){
    self.form.add_listener('change', function(){
      update_ui();
    })
  }
  var _m = {};
  Object.defineProperty(self, "data", {
    get: function () {
      return _m;
    },
    set: function (n) {
      _m = n;
      update_ui();
    }
  });
  function update_ui(){
    var text = self.form.data.text;
    var tokens = [];
    var s = "";
    for (var i=0; i<text.length; i++) {
      var c = text.charAt(i);
      if (c == " ")
      {
        if (s)
          tokens.push(s);
        s = "";
      } else if (c == "." || c == "," || c == "!" || c == "?") {
        if (s)
          tokens.push(s);
        s = "";
        tokens.push(c);
      } else {
        s += c;
      }
    }
    if (s)
      tokens.push(s);
    var $x = $$();
    var selecting = false;
    for (var i=0; i<tokens.length; i++)
    {
      (function (token) {
        var $s = $$("token");
        $s.text(token);
        $s.mousedown(function () {
          selecting = true;
          $s.toggleClass('select');
        });
        $s.mouseover(function(){
          if (selecting)
            $s.addClass('select');
        });
        $(document).mouseup(function(){
          selecting = false;
        });
        $x.append($s);
      })(tokens[i]);
    }
    $el.empty().append($x, "<br clear='all'>");
  }
};
