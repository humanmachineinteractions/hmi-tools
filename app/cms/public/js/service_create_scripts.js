form_modules["create_scripts"] = function (form) {

  var self = this;
  var $el = mixin_basic_component(self, 'create_scripts');
  mixin_emitter(self);
  $el.css({'margin-bottom': '40px'})
  $el.append('<h3>Generate scripts...</h3>');
  var domains = null;
  var $b = $('<button disabled>START...</button>');
  $el.append($b);
  $$ajax('/cms/browse/Domain', JSON.stringify({condition: {}, order: 'name', offset: 0, limit: 40}), 'post').done(function (d) {
    $b.prop('disabled', false);
    $b.click(click_start);
    domains = d;
  });
  function click_start(e) {
    $b.css({display: 'none'});
    var $p = $$();
    $el.append($p)
    $p.append("<h4>Select domains</h4>");
    var sel = {};
    domains.results.forEach(function(d){
      var $r = $$("row");
      $p.append($r);
      var cb  = new form_fields.boolean_field({text: ' ' + d.name});
      $r.append(cb.$el());
      var inp = new form_fields.range_field({min: 0, max: 100});
      inp.$el().hide();
      $r.append(inp.$el());
      cb.add_listener('change', function(b) {
        if (b.data) {
          //inp.$el().show();
          sel[d._id] = {domain: d, rangeField: inp};
        } else {
          //inp.$el().hide();
          delete sel[d._id];
        }
      });
    });
    $p.append("<h4>Drop templated script below</h4>");
    var up = new form_fields.upload_field({cellRenderer: upload_cell});
    $p.append(up.$el());
    up.$el().css({'margin-bottom': '15px'});
    $p.append("<h4>Total number of lines</h4>");
    var total_inp = new form_fields.input_field();
    total_inp.data = 2500;
    total_inp.$el().find("input").addClass("small");
    total_inp.$el().css({'margin-bottom': '15px'});
    $p.append(total_inp.$el())
    var $bc = $('<button>CLICK TO COMPUTE</button>');
    $p.append($bc);
    $bc.click(function(){
      var domains = [];
      for (var p in sel) {
        var d = sel[p];
        domains.push(d.domain._id)
      }
      $p.hide();
      var $pp = $$();
      $el.append($pp);
      $pp.text('working');
      $$ajax('/cms/product/'+form.id+'/generate-script',
        JSON.stringify({domains: domains, templates: up.data, total: total_inp.data}), "post").done(function(e){
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
