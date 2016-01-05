define(['pv', 'spv', '../libs/BrowseMap'], function(pv, spv, BrowseMap) {
"use strict";
var binded_models = {};

var getStruc = BrowseMap.getStruc;
var getStrucSources = BrowseMap.getStrucSources;

var AppModelBase = spv.inh(pv.Model, {
	init: function(target) {
		target.navigation = [];
		// target.map = ;
		target.current_mp_md = null;
		target.on('child_change-current_mp_md', function(e) {
			if (e.target){
				this.resortQueue();
			}

		});
		target.views_strucs = {};
	}
}, {
	initMapTree: function(start_page, needs_url_history, navi) {

		pv.updateNesting(this, 'navigation', [start_page]);
		pv.updateNesting(this, 'start_page', start_page);
		this.map = new BrowseMap({app: this}, {start: this.start_page});
		this.map
			// .init(this.start_page)

			.on('changes', function(changes, models, bwlevs) {
				//console.log(changes);
				this.animateMapChanges(changes, models, bwlevs);
			}, this.getContextOptsI())
			.on('map-tree-change', function(nav_tree) {
				this.changeNavTree(nav_tree);
			}, this.getContextOptsI())

			.on('title-change', function(title) {
				this.setDocTitle(title);

			}, this.getContextOptsI())
			.on('url-change', function(nu, ou, data, replace) {
				if (needs_url_history){
					if (replace){
						navi.replace(ou, nu, data);
					} else {
						navi.set(nu, data);
					}
				}
			}, this.getContextOptsI());

		return this.map;
	},
	setDocTitle: function(title) {
		pv.update(this, 'doc_title', title);
	},
	getBMapTravelFunc: function(func) {
		return function() {
			return this.collectChanges(func, arguments);
		};
	},
	changeNavTree: function(nav_tree) {
		// this.nav_tree = spv.filter(nav_tree, 'resident');
		this.nav_tree = nav_tree;
		if (this.matchNav){
			this.matchNav();
		}

	},
	showStartPage: function(){
		//mainaly for hash url games
		this.map.startNewBrowse();
	},
	animationMark: function(models, mark) {
		for (var i = 0; i < models.length; i++) {
			pv.update(models[i].getMD(), 'map_animating', mark);
		}
	},
	animateMapChanges: (function() {


		var bindMMapStateChanges = function(app, md) {
			if (binded_models[md._provoda_id]) {
				return;
			}
			binded_models[md._provoda_id] = true;
			app.pushVDS(md);
		};

		var mapch_handlers = {
			"zoom-in": function(array) {
				var target;
				for (var i = array.length - 1; i >= 0; i--) {
					var cur = array[i];
					if (cur.type == 'move-view' && cur.value){
						target = cur;
						break;
					}

				}
				return target;
			},
			"zoom-out": function(array) {
				var target;
				for (var i = array.length - 1; i >= 0; i--) {
					var cur = array[i];
					if (cur.type == 'zoom-out' || cur.type == 'move-view'){//&& cur.value
						target = cur;
						break;
					}

				}
				return target;
			}
		};

		var complexBrowsing = function(bwlev, md, value) {
			// map levels. without knowing which map
			var obj = md.state('bmp_show');
			obj = obj && spv.cloneObj({}, obj) || {};
			var num = bwlev.state('map_level_num');
			obj[num] = value;
			pv.update(md, 'bmp_show', obj);
		};

		var model_mapch = {
			'move-view': function(change) {
				var md = change.target.getMD();
				var bwlev = change.bwlev.getMD();

				bindMMapStateChanges(md.app, md);

				var parent = change.target.getMD().getParentMapModel();
				var bwlev_parent = change.bwlev.getMD().getParentMapModel();
				if (parent){
					pv.update(bwlev_parent, 'mp_has_focus', false);
					pv.update(parent, 'mp_has_focus', false);
				}
				pv.update(md, 'mp_show', change.value);
				pv.update(bwlev, 'mp_show', change.value);
				complexBrowsing(bwlev, md,  change.value);
			},
			'zoom-out': function(change) {
				var md = change.target.getMD();
				var bwlev = change.bwlev.getMD();
				pv.update(bwlev, 'mp_show', false);
				pv.update(md, 'mp_show', false);
				complexBrowsing(bwlev, md,  false);
			},
			'destroy': function(change) {
				var md = change.target.getMD();
				var bwlev = change.bwlev.getMD();
				md.mlmDie();
				pv.update(md, 'mp_show', false);
				pv.update(bwlev, 'mp_show', false);
				complexBrowsing(bwlev, md,  false);
			}
		};

		// var minDistance = function(obj) {
		// 	if (!obj) {return;}
		// 	var values = [];
		// 	for (var key in obj) {
		// 		if (!obj[key]) {
		// 			continue;
		// 		}
		// 		values.push(obj[key]);
		// 	}

		// 	if (!values.length) {return;}

		// 	return Math.min.apply(null, values);
		// };


		// var depthValue = function(obj_raw, key, value) {
		// 	var obj = obj_raw && spv.cloneObj({}, obj_raw) || {};
		// 	obj[key] = value;
		// 	return obj;
		// };

		var goUp = function(bwlev, cb) {
			if (!bwlev) {return;}
			var count = 1;
			var md = bwlev.getNesting('pioneer');
			var cur = bwlev;
			while (cur) {
				cb(cur, md, count);
				cur = cur.map_parent;
				md = cur && cur.getNesting('pioneer');
				count++;
			}
		};

		var setDft = function(get_atom_value) {
			return function(bwlev, md, count) {
				var atom_value = get_atom_value(count);
				// var value = depthValue(md.state('bmp_dft'), bwlev._provoda_id, atom_value);
				// pv.update(md, 'bmp_dft', value);
				// pv.update(md, 'mp_dft', minDistance(value));
				pv.update(bwlev, 'mp_dft', atom_value);
			};
		};

		var dftCount = setDft(function(count) {
			return count;
		});

		var dftNull = setDft(function() {
			return null;
		});

		var depth = function(bwlev, old_bwlev) {
			goUp(old_bwlev, dftNull);
			goUp(bwlev, dftCount);
			return bwlev;
		};

		return function(changes, models, bwlevs) {
			var
				i,
				target_item,
				all_changhes = spv.filter(changes.array, 'changes');

			all_changhes = Array.prototype.concat.apply(Array.prototype, all_changhes);
			//var models = spv.filter(all_changhes, 'target');
			//this.animationMark(models, changes.changes_number);

			for (i = 0; i < all_changhes.length; i++) {
				var change = all_changhes[i];
			//	change.changes_number = changes.changes_number;
				var handler = model_mapch[change.type];
				if (handler){
					handler.call(null, change);
				}
			}

			for (i = changes.array.length - 1; i >= 0; i--) {
				//вычисление модели, которая станет главной на экране
				var cur = changes.array[i];
				if (mapch_handlers[cur.name]){
					var item = mapch_handlers[cur.name].call(null, cur.changes);
					target_item = item;
					break;
				}
			}
			/*
				подсветить/заменить текущий источник
				проскроллить к источнику при отдалении
				просроллить к источнику при приближении
			*/

			// var bwlevs = residents && spv.filter(residents, 'lev.bwlev');


			//if (tree){
				pv.updateNesting(this, 'navigation', bwlevs);
			//}


			if (target_item){
				if (this.current_mp_md) {
					pv.update(this.current_mp_md, 'mp_has_focus', false);
				}
				var target_md = this.current_mp_md = target_item.target.getMD();

				this.current_mp_bwlev = depth(target_item.bwlev.getMD(), this.current_mp_bwlev);

				pv.update(target_md, 'mp_has_focus', true);
				pv.update(target_item.bwlev.getMD(), 'mp_has_focus', true);

				pv.update(this, 'show_search_form', !!target_md.state('needs_search_from'));
				pv.update(this, 'full_page_need', !!target_md.full_page_need);
			//	pv.update(this, 'current_mp_md', target_md._provoda_id);
				pv.updateNesting(this, 'current_mp_md', target_md);
				pv.updateNesting(this, 'current_mp_bwlev', target_item.bwlev.getMD());
				//pv.update(target_md, 'mp-highlight', false);


			}


			if (target_item){
				changes.target = target_item && target_item.target;
				changes.bwlev = target_item && target_item.bwlev;
			}

			var mp_show_wrap;
			if (models){

				var all_items = models.concat(bwlevs);

				mp_show_wrap = {
					items: models,
					bwlevs: bwlevs,
					all_items: all_items,
					mp_show_states: []
				};
				for (i = 0; i < models.length; i++) {
					mp_show_wrap.mp_show_states.push(models[i].state('mp_show'));
				}
			}

			pv.updateNesting(this, 'map_slice', {
				residents_struc: mp_show_wrap,
				transaction: changes
			});


		};
	})(),
	collectChanges: function(fn, args, opts) {
		var aycocha = this.map.isCollectingChanges();
		if (!aycocha){
			this.map.startChangesCollecting(opts);
		}

		var result = fn.apply(this, args);

		if (!aycocha){
			this.map.finishChangesCollecting();
		}
		return result;
	},
	resortQueue: function(queue) {
		if (queue){
			queue.removePrioMarks();
		} else {
			for (var i = 0; i < this.all_queues.length; i++) {
				this.all_queues[i].removePrioMarks();
			}
		}
		var md = this.getNesting('current_mp_md');
		if (md){
			if (md.checkRequestsPriority){
				md.checkRequestsPriority();
			} else if (md.setPrio){
				md.setPrio();
			}
		}

		this.checkActingRequestsPriority();
	},
	routePathByModels: function(pth_string, start_md, need_constr) {
		return BrowseMap.routePathByModels(start_md || this.start_page, pth_string, need_constr);

	},
	pushVDS: (function() {
		var getSources = spv.memorize(function(md, used_data_structure, app){
			return getStrucSources(md, getStruc(md, used_data_structure, app));
		}, function(md){
			return md.constr_id;
		});

		return function(md) {
			if (!this.used_data_structure) {
				return;
			}
			var sources = getSources(md, this.used_data_structure);
			pv.update(md, 'map_slice_view_sources', [md._network_source, sources]);
		};
	})(),
	knowViewingDataStructure: function(constr_id, used_data_structure) {
		if (!this.used_data_structure) {
			this.used_data_structure = used_data_structure;
			pv.update(this.map, 'struc', used_data_structure);
		}

		for (var i = 0; i < this.map.residents.length; i++) {
			var cur = this.map.residents[i];
			this.pushVDS(cur);

		}


		//console.log(1313)
	}
});


return AppModelBase;
});
