form_modules["train_ner"] = function (form) {
  var self = this;
  var $el = mixin_basic_component(self, 'xxx');
  mixin_emitter(self);
  $el.append("<h3>NER Training</h3>");
  var $b = $("<button>GO</button>")
  $el.append($b);
  $el.append("<br>");
  $b.click(function () {
    var url = form.app.base_url + '/corpus/' + form.id + '/train_ner';
    $$ajax(url).done(function (r) {
      console.log(r);
    });
  });
};