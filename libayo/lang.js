/**
 * @license
 * lang.js - v0.1
 * Copyright (c) 2014, Alexandre Ayotte
 *
 * lang.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/MIT
 */

define( 
	[ 'libayo/ayo' ],
	function( AYO ) {
		var lang = {}

		// BIZARREMENT la tablette cheap AOSON n'a pas le find????
		
		// https://tc39.github.io/ecma262/#sec-array.prototype.find
		if (!Array.prototype.find) {
		  Object.defineProperty(Array.prototype, 'find', {
		    value: function(predicate) {
		     // 1. Let O be ? ToObject(this value).
		      if (this == null) {
		        throw new TypeError('"this" is null or not defined');
		      }

		      var o = Object(this);

		      // 2. Let len be ? ToLength(? Get(O, "length")).
		      var len = o.length >>> 0;

		      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
		      if (typeof predicate !== 'function') {
		        throw new TypeError('predicate must be a function');
		      }

		      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
		      var thisArg = arguments[1];

		      // 5. Let k be 0.
		      var k = 0;

		      // 6. Repeat, while k < len
		      while (k < len) {
		        // a. Let Pk be ! ToString(k).
		        // b. Let kValue be ? Get(O, Pk).
		        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
		        // d. If testResult is true, return kValue.
		        var kValue = o[k];
		        if (predicate.call(thisArg, kValue, k, o)) {
		          return kValue;
		        }
		        // e. Increase k by 1.
		        k++;
		      }

		      // 7. Return undefined.
		      return undefined;
		    },
		    configurable: true,
		    writable: true
		  });
		}

		lang.dictLogicalVersion = 1

		if (window.CURLANG) lang.CURLANG = window.CURLANG.toLowerCase()
		else lang.CURLANG = 'fr'
		

		lang.OFFILANG = 'fr'; // ou 'en ---> i.e. LAQUELLE DES 2 LANG OFFICIELLE CAN EST DERN CHOISIE
		lang.AUTLANG = null; // savoir si un autre langue que FR/EN, ainsi si (! NULL), on sait qu'il faut afficher 2 lignes, CHINOIS + FR

		lang.checkCookieLang = function() {
			var cookieLang = AYO.getCookie( "LANG" )
			if ((cookieLang==null) || (cookieLang=="")) cookieLang = 'fr';
			if ((lang.CURLANG==null) || (lang.CURLANG=="")) changeLang( cookieLang, true )
			else if (cookieLang != lang.CURLANG) changeLang( cookieLang, true )
			//
			var cookieLang = AYO.getCookie( "OFFILANG" );
			console.log("............................................... cookieLang:",cookieLang)
			if ((cookieLang==null) || (cookieLang=="")) cookieLang = 'fr';
			if ((lang.OFFILANG==null) || (lang.OFFILANG=="")) changeOffiLang( cookieLang, true )
			else if (cookieLang != lang.OFFILANG) changeOffiLang( cookieLang, true )
			//
			console.log("cookieLang.CURLANG = ",lang.CURLANG,"cookieLang.OFFILANG = ",lang.OFFILANG );
		}
		lang.changeOffiLang = function( newLang ) {
			if ((newLang == "fr") || (newLang == 'en')) {
				lang.OFFILANG = newLang
			}
		}
		function changeLang( newLang, forceChange ) {
			console.log("lang.CURLANG = ",lang.CURLANG );
			console.log("newLang = ",newLang );
			
			if ((newLang!=null) && (newLang.length>0)) {
				newLang = newLang.toLowerCase();
				//
				if ((forceChange) || (lang.CURLANG != newLang)) {
					AYO.setCookie( "LANG", newLang, 30 )
					if ((newLang == "fr") || (newLang == 'en')) {
						lang.OFFILANG = newLang;
						lang.AUTLANG = false;
						AYO.setCookie( "OFFILANG", newLang, 30 );
					}
					else {
						lang.AUTLANG = newLang; // OFFILANG reste la dern lang offici can choisie
					}
					lang.CURLANG = newLang;
					return true;
				}
			}
			console.log("...no change")
			return false;
		}
		lang.changeLang = changeLang


		/////AA2017nov21 
		lang.tradDict = {fr:{}, en:{} } ///  , __:{}, ... }
		//
		//
		// facon v3 : tradDict = [  [id,code,fr,en, ...], ...  ]
		
		var indexLANG = ["id",  "grp",  "code",  "fr",  "en",    "es", "pt", "zh", "ar", "hi"];
		//                 0      1       2        3     4        5     6     7     8     9
		
		var langFinder = {
			doFind : function( line, i, list ){
				//onsole.log("doFind()", line, i )
				//  id,  grp,  code,  fr,  en,    es, pt, zh, ar, hi
				//   0   1     2      3    4      5   6   7   8   9
				if ((this.codeT!=null) && (line[2]==this.codeT)) return true
				if (this.dictT == 'fr') return false //si on cherche FR, on ignore la defval en fr!
				if (this.frT && ((line[3]==this.frT) || (line[2]==this.frT))) return true
				return false
			},
			initFind : function( code, fr, whichdict, onlyOffi ){
				if ((whichdict==null) || (whichdict==undefined)) {
					if (onlyOffi) whichdict = lang.OFFILANG
					else whichdict = lang.CURLANG
				}
				//NON: on veut prendre le txt de la DB si améliorée p/r code :::  if ((code=='')&&(whichdict == 'fr')) return fr
				if (code=='') code = null;
				if (fr=='') fr = null;
				//
				this.dictT = whichdict
				this.codeT = code;
				this.frT = fr;
				// magic:
				var line = lang.tradDict.find( this.doFind, this );
				if (line==undefined) {
					if (code!=null) line = [-999,0,code,code,'',  '','','','','']; //  BADLANG :-(
					else line = [-999,0,fr,fr,'',  '','','','',''];
					//console.log("NOT** FOUND!?: line=", line )
				}
				//else {
					//console.log("FOUND...: line=", line, "("+code+"), ("+fr+")" )
				//}
				//
				if (whichdict == 'fr') {
					var fr = line[3]
					if (fr=='') return ["FR("+line[2]+")"]
					return [fr]
				}
				if (whichdict == 'en') {
					var en = line[4]
					if (en=='') return ["EN("+line[3]+")"]
					return [en]
				}
				// new : on ajoute en 2e position la langue officielle actuellement en cours
				var l3 = indexLANG.indexOf( whichdict );
				var l2 = indexLANG.indexOf( lang.OFFILANG );
				//console.log( )
				if ((l3 > -1) && (l2 > -1)) return [ line[l3], line[l2] ]; //NEW 2018 avril 24
				//
				return [ fr, code, whichdict, line[3] ]; //NEW 2018 avril 24
			},
			dictT : 'en',
			codeT : null,
			frT : ''
		}
		
		lang.whichGroup = null
		lang.regroup = function( list ){
			if (list[1] == this.whichGroup) return true
			return false
		}
		lang.filterGroup = function( group ) {
			if (this.uniqGrpDTA) {
				var k = this.uniqGrpNDX.indexOf(group);
				if (k > -1) return this.uniqGrpDTA[ k ];
			}
			//
			this.whichGroup = group
			return this.tradDict.filter( this.regroup, this );
		}
		
		lang.tradB = function( id, defval, whichdict, onlyOffi ) {
			if ((defval===undefined) || (defval===null)) {
				defval = id
				id = ''
			}
			return langFinder.initFind( id, defval, whichdict, onlyOffi )
		}
		
		function trad( id, defval, whichdict, onlyOffi ) {
			// pas utiliser THIS car on peut l'utiliser sans objet (ex: var TRAD = lang.trad; TRAD('ceci'); )
			if (lang.dictLogicalVersion==3) {
				//
				//onsole.log("LANG.TRAD() ("+id+"), ("+defval+"), ("+whichdict+")" )
				if (defval==undefined || defval==null) {
					//onsole.log("trad() ... defval == null || undefined...")
					defval = id
					id = ''
				}
				var lst = langFinder.initFind( id, defval, whichdict, onlyOffi )
				return lst[0];
			}
			////old way, unused...in reality
			if ((whichdict==null) || (whichdict==undefined)) {
				if (onlyOffi) whichdict = lang.OFFILANG
				else whichdict = lang.CURLANG
			}
			var val = lang.tradDict[ whichdict ][id]
			if ((val==null) || (val==undefined)) return defval
			return val
		}
		lang.trad = trad
		lang.dictInternalVersion = 1
		function add2Dict( id, frv, env ) {
			if (this.dictLogicalVersion==3) {
				console.warn("2017juillet - add2Dict() devenu impossible");
				return
			}
			if (frv) lang.tradDict.fr[id] = frv
			if (env) lang.tradDict.en[id] = env
			lang.dictInternalVersion += 1
		}
		lang.add2Dict = add2Dict
		lang.langueInconnue = function( laquelle ) {
			if (this.dictLogicalVersion==3) {
				laquelle.toString().toLowerCase()
				return (laquelle != 'fr') && (laquelle != 'en');
			}
			var l = lang.tradDict[ laquelle ] || null
			return (l == null)
		}

		var uniqGroups = function() {
			var tot,i,k, uniqGrpNDX,uniqGrpDTA, prevgrp, grp, r, tradDict
			tradDict = lang.tradDict
			uniqGrpNDX = []
			uniqGrpDTA = []
			tot = tradDict.length
			for(i=0; i<tot; i++) {
				r = tradDict[i]
				grp = r[1]
				k = uniqGrpNDX.indexOf(grp);
				if (k < 0) {
					uniqGrpNDX.push( grp )
					k = uniqGrpNDX.length-1
					uniqGrpDTA.push( [] );
				}
				uniqGrpDTA[k].push( r )
			}
			lang.uniqGrpNDX = uniqGrpNDX;
			lang.uniqGrpDTA = uniqGrpDTA;
		}
		lang.uniqGrpNDX = null;
		lang.uniqGrpDTA = null;
		lang.uniqGroups = function() { return this.uniqGrpNDX }
		
		lang.receiveDictionnaire = function( biglist ) {
			if (this.dictLogicalVersion==3) {
				this.tradDict = biglist
				console.log( "DICT v3 directly LOADED! (silently...) view.allRecords way:", biglist.length )
				lang.dictInternalVersion += 1
				//2018 fev 16 ...group prétriés et EN ORDRE ! (sale js)
				uniqGroups();
				//
				return;
			}
			if (this.dictLogicalVersion==2) {
				this.tradDict = biglist
				console.log( "DICT v2 directly LOADED! (silently...) tot lines:", biglist.fr.length )
				lang.dictInternalVersion += 1
				return;
			}
			//---------------------------
			//onsole.log( "HTML.receiveDictionnaire(r) !!!" )
			//onsole.log( biglist )
			if ((!biglist) || (biglist=='')) return;
			//
			var tot,i, records, iid, ifr,ien, r, tradDict
			tradDict = lang.tradDict
			records = biglist['records']
			tot = records.length
			for(i=0; i<tot; i++) {
				r = records[i]
				iid = r[0]
				ifr = r[1] || ''
				ien = r[2] || ''
				tradDict.fr[iid] = ifr
				tradDict.en[iid] = ien
			}
			//onsole.log( "DICT LANG LOADED! (silently...) tot lines:", tradDict.fr.length, 'vs', tot )
			lang.dictInternalVersion += 1
		}		
		
		return lang
	}
)