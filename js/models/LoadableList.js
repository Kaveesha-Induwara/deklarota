define(['./LoadableListBase', 'spv', 'js/libs/Mp3Search', 'pv'], function(LoadableListBase, spv, Mp3Search, pv){
"use strict";

var LoadableList = spv.inh(LoadableListBase, {
	naming: function(fn) {
		return function LoadableList(arg1, arg2, arg3, arg4, arg5, arg6) {
			fn(this, arg1, arg2, arg3, arg4, arg5, arg6);
		};
	},
	props: {}
});

var TagsList = spv.inh(LoadableList, {}, {
	model_name: 'tagslist',
	main_list_name: 'tags_list',
	addTag: function(name, silent) {
		var main_list = this.getMainlist();
		main_list.push(name);

		if (!silent){
			//pv.updateNesting(this, this.main_list_name, main_list);
			pv.update(this, this.main_list_name, [].concat(main_list));
		}
	},
	dataListChange: function() {
		var main_list = this.getMainlist();
		pv.update(this, this.main_list_name, [].concat(main_list));

	},
	addItemToDatalist: function(obj, silent) {
		this.addTag(obj, silent);
	},
	'compx-simple_tags_list': {
		depends_on: ['tags_list', 'preview_list'],
		fn: function(tag_list, preview_list){
			return tag_list || preview_list;
		}
	},
	setPreview: function(list) {
		pv.update(this, 'preview_list', list);
	},
	showTag: function(tag_name) {
		this.app.show_tag(tag_name);
	}
});
LoadableList.TagsList = TagsList;

return LoadableList;
});
