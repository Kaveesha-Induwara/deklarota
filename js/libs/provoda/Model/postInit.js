define(function(require) {
'use strict';
var initDeclaredNestings = require('../initDeclaredNestings');
var prsStCon = require('../prsStCon');
var initWatchList = require('../nest-watch/index').initList;
var initNestSel = require('../dcl/nest_sel/init');
var initNestConcat = require('../dcl/nest_conj/init');
var initApis = require('../StatesEmitter/apis/init')


function connectStates(self) {
  // prefill own states before connecting relations
  self.__initStates();

  prsStCon.connect.parent(self);
  prsStCon.connect.root(self);
  prsStCon.connect.nesting(self);

  initWatchList(self, self.compx_nest_matches)
}

function connectNests(self) {
  if (self.nestings_declarations) {
    self.nextTick(initDeclaredNestings, null, false, self.current_motivator);
  }

  initNestSel(self);
  initNestConcat(self);
}

return function postInitModel(self) {
  connectStates(self)
  connectNests(self)

  initWatchList(self, self.st_nest_matches)

  initApis(self)
}
})
