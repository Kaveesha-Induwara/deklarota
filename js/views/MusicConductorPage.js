define(['provoda', './coct', function(provoda, coct) {
"use strict";

var MusicConductorPage = function() {};
coct.PageView.extendTo(MusicConductorPage, {
	createBase: function() {
		this.c = this.root_view.getSample('music_conductor_page');
		this.createTemplate();
	},
	children_views: {
		allpas: coct.LiListsPreview,
		countres: coct.LiListsPreview
	}
});

return MusicConductorPage;
}]);