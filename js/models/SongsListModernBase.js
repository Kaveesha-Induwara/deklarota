define(function(require) {
'use strict';
var pv = require('pv');
var wrapInputCall = require('pv/wrapInputCall')
var PlayRequest = require('./ListPlayRequest')

var targetPathNext = function(name) {
  return [
    name, {
      base: 'arg_nesting_next',
      map_values_list_to_target: true,
    },
  ]
}

var marks = function(value) {
  return function(data) {
    if (data.next_value && data.prev_value) {
      return {
        prev: false,
        next: value,
      }
    }

    if (data.next_value) {
      return {
        next: value,
      }
    }

    if (data.prev_value) {
      return {
        prev: false,
      }
    }
  }
}

return {
  '+nests': {
    'first_song': [
      'compx', ['<< @one:songs-list'],
    ],
    'possible_playlist_song': [
      'compx',
      ['<< @one:first_song.flow_next_possible'],
    ],
    'vis_prev_modern': [
      'compx',
      ['< @one:vis_neig_prev < being_viewed_song'],
    ],
    'vis_next_modern': [
      'compx',
      ['< @one:vis_neig_next < being_viewed_song'],
    ],
  },
  actions: {
    'handleNesting:vis_prev_modern': {
      to: {
        next: [
          '< marked_as', {
            base: 'arg_nesting_next',
          },
        ],
        prev: [
          '< marked_as', {
            base: 'arg_nesting_prev',
          },
        ],
      },
      fn: marks('prev'),
    },
    'handleNesting:vis_next_modern': {
      to: {
        next: [
          '< marked_as', {
            base: 'arg_nesting_next',
          },
        ],
        prev: [
          '< marked_as', {
            base: 'arg_nesting_prev',
          },
        ],
      },
      fn: marks('next'),
    },
    'handleNesting:songs-list':  {
      to: {
        new_prev_cicled: targetPathNext('<< prev_cicled_by_number'),
        new_prev:  targetPathNext('<< prev_by_number'),
        new_number: targetPathNext('number'),
        new_next:  targetPathNext('<< next_by_number'),
        new_next_cicled:  targetPathNext('<< next_cicled_by_number'),
      },
      fn: function(data) {
        // var old = data.prev_value
        var list = data.next_value
        var result_mut = {
          new_prev_cicled: new Array(list.length),
          new_prev:  new Array(list.length),
          new_number: new Array(list.length),
          new_next:  new Array(list.length),
          new_next_cicled:  new Array(list.length),
        }

        for (var i = 0; i < list.length; i++) {
          var is_start = i === 0
          var is_end = (i + 1) === list.length

          var first = list[0];
          var last = list[list.length - 1];

          var prev = !is_start ? list[i - 1] : null;
          var prev_ci = prev || last
          var next = !is_end ? list[i + 1] : null;
          var next_ci = next || first

          result_mut.new_prev_cicled[i] = prev_ci
          result_mut.new_prev[i] = prev
          result_mut.new_number[i] = i
          result_mut.new_next[i] = next
          result_mut.new_next_cicled[i] = next_ci
        }

        return result_mut
      }
    },
  },
  _playWanted: (function() {
    var selectBwlev = function(self, bwlev_id) {
      if (!bwlev_id) {
        return self._getMySimpleBwlev()
      }
      return pv.getModelById(self, bwlev_id);

    }

    return wrapInputCall(function(bwlev_id) {
      var bwlev = selectBwlev(this, bwlev_id)

      var play_request = pv.create(PlayRequest, {}, {
        nestings: {
          wanted_playlist: this,
          bwlev: bwlev,
        }
      }, this, this.app);

      if (this.app.player) {
        this.app.player.requestPlay(play_request);
      }
    })
  })()
}
})
