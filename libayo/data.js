/**
 * @license
 * data.js - v0.1
 * Copyright (c) 2014, Alexandre Ayotte
 *
 * data.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/MIT
 */

define( 
	function() {
		var data = {}
		var builtin = true
		
		var ram = {}
		
		if ((typeof localStorage == "undefined") || (typeof JSON == "undefined")) {
			localStorage = {}
			builtin = false
		}
		
		//load existing from last visit
		console.log("[data LOADINIT.]")
		var tot,i,what,which
		tot = localStorage.length
		for (i=0; i<tot; i++) {
			which = localStorage.key(i)
			what = localStorage.getItem(which)
			console.log("    ",i,"[",which,".length=",what.length,"]")
			what = JSON.parse( what )
			ram[ which ] = what
		}
		console.log("[data done.]")
		
		data.get = function( which, defval ) {
			var what
			what = ram[which]
			if ((what==null) || (what==undefined)) {
				if ((defval!=null) && (defval!=undefined)) {
					ram[which] = defval
					this.touch( which )
				}
				what = defval
			}
			return what
		}
		
		//une fois des changements fait dans un des gros array, on "touch" pour le sauver localement
		data.touch = function( which ) {
			if (builtin) {
				var what = this[which]
				if ((what==null) || (what==undefined) || (what=="")) {
					localStorage.removeItem( which )
				}
				else {
					what = JSON.stringify( what )
					localStorage.setItem( which, what )
				}
			}
		}
		
		return data
	}
)