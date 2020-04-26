define(function(require) {
'use strict';
var pv = require('../provoda');
var spv = require('spv');
var BrowseMap = require('./BrowseMap');

var AppModelBase = spv.inh(BrowseMap.Model, {
  init: function(target) {
    target.app = target

    target.all_queues = target.all_queues || []

    target.views_strucs = {};
  },
  postInit: function(target) {
    if (target.zero_map_level) {
      // start_page will be app root

      if (target.hasOwnProperty('start_page')) {
        return
      }
      target.start_page = target
      return
    }

    if (!target['chi-start__page']) {
      console.warn('add chi-start__page or zero_map_level:true to AppModelBase')
      return
    }

    if (target.hasOwnProperty('start_page')) {
      return
    }
    target.start_page = target.initChi('start__page')
  }
}, {
  checkActingRequestsPriority: function() {
    if (typeof NODE_ENV != 'undefined' && NODE_ENV === 'production') {
      return
    }

    console.warn('add checkActingRequestsPriority')
  },
  model_name: 'app_model',
  skip_map_init: true,

  animationMark: function(models, mark) {
    for (var i = 0; i < models.length; i++) {
      pv.update(models[i].getMD(), 'map_animating', mark);
    }
  },

  resortQueue: function(queue) {
    if (queue){
      queue.removePrioMarks();
    } else {
      for (var i = 0; i < this.all_queues.length; i++) {
        this.all_queues[i].removePrioMarks();
      }
    }
    var md = this.important_model;
    if (md){
      if (md.checkRequestsPriority){
        md.checkRequestsPriority();
      } else if (md.setPrio){
        md.setPrio();
      }
    }

    this.checkActingRequestsPriority();
  },

  routePathByModels: function(pth_string, start_md, need_constr, strict, options) {
    return BrowseMap.routePathByModels(start_md || this.start_page, pth_string, need_constr, strict, options);
  },
});


return AppModelBase;
});
