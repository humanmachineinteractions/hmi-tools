form_fields["image_url_field"] = function () {
  var self = this;
  var $el = $$("image_url").data("__obj__", self);
  self.$el = function () { return $el; };
  var url = null;
  Object.defineProperty(self, "data", {
    get: function () {
      return url;
    },
    set: function (n) {
      url = n;
      $el.html('<img src="'+url+'">');
    }
  });
};
