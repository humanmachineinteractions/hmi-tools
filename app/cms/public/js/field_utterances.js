form_fields["utterances_field"] = function () {
  var self = this;
  var $el = mixin_basic_component(self, "utterances");
  mixin_emitter(self);

  var ad = new form_fields.add_remove(utterance_cell, {type: 'Utterance', array: true})
  ad.add_listener('select', function(e, d){
    self.emit('select', {type: "Utterance", _id: d._id, field: ad})
  })
  ad.add_listener('change', function(e, d){
    console.log('change', ad.data.length);
    self.emit('change');
  });

  Object.defineProperty(self, "data", {
    get: function () {
      return ad.data;
    },
    set: function (n) {
      if (!n) n = [];
      ad.data = n;
      update_ui();
    }
  });

  function update_ui(){
    $el.empty();
    $el.append(ad.$el());
  }

  function utterance_cell(){
    var self = this;
    var $el = mixin_basic_component(self);
    mixin_emitter(self);
    mixin_data(self, update_ui, {});
    function update_ui(){
      $el.empty();
      $el.append(self._data.orthography);
    }
    $el.dblclick(function () {
      self.emit('select', self.data);
    })
  }
};
