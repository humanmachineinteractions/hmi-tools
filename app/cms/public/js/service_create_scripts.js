form_modules["create_scripts"] = function (form) {

  var self = this;
  var $el = mixin_basic_component(self, 'create_scripts');
  mixin_emitter(self);
  $el.css({'margin-bottom': '40px'})
  $el.append('<h3>Create a script...</h3>');
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
      cb.add_listener('change', function(b) {
        if (b.data) {
          sel[d._id] = {domain: d};//, rangeField: inp
        } else {
          delete sel[d._id];
        }
      });
    });
    $p.append("<h4>Script Importance</h4>");
    var $r = $$();
    $r.css({'margin-bottom': '15px'});
    var total_rng = new form_fields.range_field({min: 10, max: 500});
    total_rng.data = 50;
    // var total_inp = new form_fields.input_field();
    // total_rng.add_listener('change', function(){
    //   total_inp.data = total_rng.data;
    // })
    $r.append(total_rng.$el());
    $r.append("<div style='font-size:10px'><span>less</span><span style='float:right'>more</span></div>");
    //$r.append(total_inp.$el());
    $p.append($r);

    $p.append("<h4>Sentence Length</h4>");
    var $r2 = $$();
    $r2.css({'margin-bottom': '15px'});
    var total_rng2 = new form_fields.range_field({min: 33, max: 233});
    total_rng2.data = 135;
    // var total_inp2 = new form_fields.input_field();
    // total_rng2.add_listener('change', function(){
    //   total_inp.data = total_rng.data;
    // })
    $r2.append(total_rng2.$el());
    $r2.append("<div style='font-size:10px'><span>shorter</span><span style='float:right'>longer</span></div>");
    $p.append($r2)

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
      $$ajax('/cms/product/'+form.id+'/generate-domain-script',
        JSON.stringify({domains: domains, total: total_rng.data, sentenceLength: total_rng2.data}), "post").done(function(e){
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


};
