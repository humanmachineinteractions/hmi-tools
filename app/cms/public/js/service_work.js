form_modules["work"] = function (form) {
  var self = this;
  var $el = mixin_basic_component(self, 'work');
  mixin_emitter(self);
  $el.css({'margin-bottom': '40px'})
  $el.append('<h3>Work</h3>');
  var $t = $$();
  $el.append($t);
  var f = new work_view(work_cell, {});
  f.add_listener('remove', function(a,b){
    console.log('remove',a,b)
  });
  $el.append(f.$el());
  var tid = -1;
  function get_work(){
    $$ajax('/cms/work', JSON.stringify({type:form.type, id:form.id}), "post").done(function(w){
      f.data = w;
      tid = setTimeout(get_work, 2500);
    })
  }
  get_work();
  self.destroy = function(){
    clearTimeout(tid);
  }

  // var socket = io.connect('http://localhost:3011');
  // var uid = $("#user-menu").find("a").prop("href");
  // uid = uid.substring(uid.lastIndexOf('/') + 1);
  // socket.emit('user', uid);
  // socket.emit('get-work', {type:form.type, id:form.id});
  // socket.on('work', function (data) {
  //   console.log(data)
  //   f.data = data;
  // });
  // socket.on('work-log', function(d){
  //   $t.text(d.message);
  // })
  // socket.on('work-new', function(d){
  //   f.data.push(d);
  // })


  function work_view(){
    var self = this;
    var $el = mixin_basic_component(self);
    mixin_emitter(self);
    mixin_data(self, update_ui, {});
    var $t = $$(),
      $c = $$();
    $el.append($t, $c);
    var cells = {};
    function update_ui(){
      var found = {};
      self._data.forEach(function(l) {
        var c;
        if (cells[l._id]) {
          c = cells[l._id];
        } else {
          c = new work_cell();
          cells[l._id] = c;
          $c.append(c.$el());
        }
        c.data = l;
        found[l._id] = true;
      });
      //console.log("removing what is not in this map", found);
    }
  }

  function work_cell(){
    var self = this;
    var $el = mixin_basic_component(self);
    mixin_emitter(self);
    mixin_data(self, update_ui, {});
    var $logs = $$('logs'),
      $t = $$(),
      $i = $('<i class="fa fa-chevron-right"></i>').css({'font-size':'9px', 'padding-right': '5px'}),
      $ts = $('<span></span>'),
      $x = $('<button>ABORT</button>');

    $t.append($i, $ts);
    $el.append($t, $logs, $x);
    // toggler
    var logVis = true;
    function toggleLogs(b){
      if (b) {
        $logs.css({display: 'block'});
        $i.removeClass('fa-chevron-right');
        $i.addClass('fa-chevron-down');
        $x.css({display: 'block'});
      } else {
        $logs.css({display: 'none'});
        $i.removeClass('fa-chevron-down');
        $i.addClass('fa-chevron-right');
        $x.css({display: 'none'});
      }
      logVis = b;
    }
    $t.click(function(){ toggleLogs(!logVis)});
    confirm_inline($x, 'Really delete?', function(){
      self.emit('wait');
      $$ajax('/cms/work/'+self._data._id+'/abort', null, "post").done(function(){
        $el.remove();
        self.emit('refresh');
      })
    });

    // update logging
    var lastLen = -1;
    function update_ui() {
      if (lastLen == -1) {
        lastLen = self._data.logs.length;
      }
      if (lastLen != self._data.logs.length) {
        //toggleLogs(true);
        lastLen = self._data.logs.length;
      }

      $ts.text(self._data.type);
      $logs.empty();
      var a = Math.max(self._data.logs.length - 4, 0);
      var b = self._data.logs.length;
      for (var i=a; i<b; i++) {
        var s = self._data.logs[i];
        var $wld = $$("work-log-date").text(moment(s.timestamp).format('MMM DD HH:mm'));
        var $wlm = $$("work-log-message").text(s.message);
        var $ll = $$();
        $ll.append($wld,$wlm);
        $logs.append($ll);
      }
    }
  }
};
