form_modules["templated_scripts"] = function (form) {

  var self = this;
  var $el = mixin_basic_component(self, 'templated_script');
  mixin_emitter(self);
  $el.css({'margin-bottom': '40px'})
  $el.append('<h3>Templated...</h3>');
  var $b = $('<button >START...</button>');
  $b.click(click_start);
  $el.append($b);
  function click_start(e) {
    $b.css({display: 'none'});
    var $p = $$();
    $el.append($p)
    $p.append("<h4>Drop templated script(s) below</h4>");
    $p.append("<p>XLSX only. Sheet names should reference a domain.</p>");
    var up = new form_fields.upload_field({cellRenderer: upload_cell});
    $p.append(up.$el());
    up.$el().css({'margin-bottom': '15px'});
    $p.append("<h4>Total number of lines</h4>");
    var total_inp = new form_fields.input_field();
    total_inp.data = 100;
    total_inp.$el().find("input").addClass("small");
    total_inp.$el().css({'margin-bottom': '15px'});
    $p.append(total_inp.$el())
    var $bc = $('<button>CLICK TO COMPUTE</button>');
    $p.append($bc);
    $bc.click(function(){
      $p.hide();
      var $pp = $$();
      $el.append($pp);
      $pp.text('working');
      $$ajax('/cms/product/'+form.id+'/generate-templated-script',
        JSON.stringify({templates: up.data, total: total_inp.data}), "post").done(function(e){
          $pp.text(JSON.stringify(e))
      })
    })
    var $bcc = $('<button>CANCEL</button>');
    $p.append($bcc);
    $bcc.click(function(){
      $p.remove();
      $b.css({display: 'block'})
    })
  }

  function upload_cell(){
    var self = this;
    var $el = mixin_basic_component(self);
    $el.css({'color': 'black'})
    mixin_emitter(self);
    mixin_data(self, update_ui, {});
    function update_ui(){
      $el.empty();
      $el.append(self._data.name);
    }
  }

};
