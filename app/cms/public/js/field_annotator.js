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
    var tokens = tokenize(self.form.data.text);
    var $x = $$();
    var clicked = -1;
    function $t(idx) {
      return $($x.children()[idx]);
    }
    var over = function (idx) {
      var range;
      if (idx < clicked)
        range = [idx, clicked];
      else
        range = [clicked, idx];
      for (var i=0; i<tokens.length; i++)
        $t(i).removeClass('select');
      for (var i=range[0]; i<range[1] + 1; i++)
        $t(i).addClass('select');
    };

    for (var i=0; i<tokens.length; i++)
    {
      (function (token, idx) {
        var $s = $$("token");
        $s.text(token);
        $s.mousedown(function () {
          clicked = idx;
          over(idx);
        });
        $s.mouseover(function(){
          if (clicked != -1)
            over(idx);
        });
        $(document).mouseup(function(){
          clicked = -1;
        });
        $x.append($s);
      })(tokens[i], i);
    }
    $el.empty().append($x, "<br clear='all'>");
  }
};


// utility
function tokenize(text) {
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
  return tokens;
}