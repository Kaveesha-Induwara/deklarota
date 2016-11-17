define(function (require) {
'use strict';
var checkNestWatchs = require('./add-remove').checkNestWatchs;
var orderItems = require('./orderItems');

return function checkNesting(self, collection_name, array, removed) {
  checkNestWatchs(self, collection_name, array, removed);

  var changed_nawchs = checkChangedNestWatchs(self, collection_name);
  if (!changed_nawchs) {return;}
  //var calls_flow = (opts && opts.emergency) ? main_calls_flow : self.sputnik._getCallsFlow();
  var calls_flow = self._getCallsFlow();
  for (var i = 0; i < changed_nawchs.length; i++) {
    var cur = changed_nawchs[i];
    calls_flow.pushToFlow(null, cur.nwatch, null, array, handleEndItems, null, self.current_motivator);
  }
};



function handleEndItems(motivator, _, lnwatch) {
  orderItems(lnwatch);
  lnwatch.handler.call(null, motivator, null, lnwatch, null, lnwatch.ordered_items);
}

function checkChangedNestWatchs(md, collection_name) {
	if (!md.nes_match_index || !md.nes_match_index[collection_name]) {return;}
  // console.log('match!', collection_name);
  var nwats = md.nes_match_index[collection_name];

  var result = [];
  for (var i = 0; i < nwats.length; i++) {
    var cur = nwats[i];
    if (cur.nwatch.ordered_items_changed) {
      result.push(cur);
      // console.log(cur.selector, cur);
    }

  }

  return result.length && result;
}
});
