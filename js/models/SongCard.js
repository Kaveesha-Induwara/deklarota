define(['provoda', 'spv', 'app_serv', 'js/libs/BrowseMap'],
function(provoda, spv, app_serv, BrowseMap) {
'use strict';
var SongCard = function() {};
BrowseMap.Model.extendTo(SongCard, {
	model_name: 'songcard',
	init: function(opts, params) {
		this._super(opts);
		spv.cloneObj(this.init_states, params);
		
		this.initStates();
	},
	'compx-nav_title': {
		depends_on: ['artist_name', 'track_name'],
		fn: function(artist_name, track_name) {
			return artist_name + ' - ' + track_name;
		}
	}
});
return SongCard;
});