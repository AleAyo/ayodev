/**
 * @license
 * ayo.js - v0.2-1804
 * Copyright (c) 2014, Alexandre Ayotte
 *
 * ayo.js is licensed under the MIT License.
 * https://www.opensource.org/licenses/MIT
**/
// ayo.js (Application I/o protocol :-)  
// (c) 2015 Alexandre Ayotte
// 0.1 2015-02-19 simplification de pianova / ayo.js -- OUPS: tout est parti!!!
// 0.3 2016-05-28 (incluant ayo.php problemes with FFox)
// 0.4 2016-09-13 ...major rewrite for security SESSYO! + AAON
// 0.5 2017-05-23 ...https// rends inutile AAON & y avait un defaut de conception [ça ne mrchait que si toute valeur etait encryptee]

define( 
	function() {
		var ayo = {}
		ayo.ayo_version = "Ayo2-1804"

		var moisFrancais = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
		var moisAbrev = ['janv','fév','mars','avr','mai','juin','juil','août','sept','oct','nov','déc']
		var moisEnglish = ['January','February','March','April','May','June','July','August','September','October','November','December']
		var moisEnAbbrev = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec']
		var jourFRsem = [0, 'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi' ]
		var jourENsem = [0, 'Sunday', 'Monday', 'Thuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]
		ayo.belleGrandeDate = function( d, avecJourSem, lang ){
			if (d==undefined || d==null) d = new Date()
			if (typeof d == "string") {
				var p = d.split("-");
				d = {}
				d.getDate = function() { return p[2]*1; }
				d.getMonth = function() { return (p[1]*1)-1; }
				d.getFullYear = function() { return p[0]; }
			}
			var j, js = ''
			if (lang=='en') {
				j = d.getDate()
				if (j==1) j = "1st";
				else if (j==2) j = "2nd"
				else j = j+"th";
				//
				if (avecJourSem>0 && avecJourSem<8) js = jourENsem[avecJourSem]+", "
				return js+
					moisEnglish[ d.getMonth() ] + " "+ 
					j + ", "+
					d.getFullYear()
			}
			if (avecJourSem>0 && avecJourSem<8) js = jourFRsem[avecJourSem]+", "; //+"("+avecJourSem+")"
			return js + (((j=d.getDate())<10)? "0"+j : j) +" "+
				moisFrancais[ d.getMonth() ] + " "+ 
				d.getFullYear();
		}
		ayo.belleDate = function( d, sansSecondes, sansHeure ){
			if (d==undefined || d==null) d = new Date()
			var j
			if (sansSecondes==undefined || sansSecondes==null) {
				return (((j=d.getDate())<10)? "0"+j : j) +" "+
				moisAbrev[ d.getMonth() ] + " "+ 
				d.getFullYear() + 
				" à "+
				(((j=d.getHours())<10)? "0"+j : j) + ":" +
				(((j=d.getMinutes())<10)? "0"+j : j) + ":" +
				(((j=d.getSeconds())<10)? "0"+j : j);
			}
			//else
			//   ON VEUT PAS DE SECONDES ...à moins qu'on veuille meme pas d'heure?
			if (sansHeure==undefined || sansHeure==null) {
				return (((j=d.getDate())<10)? "0"+j : j) +" "+
				moisAbrev[ d.getMonth() ] + " "+ 
				d.getFullYear() + 
				" à "+
				(((j=d.getHours())<10)? "0"+j : j) + ":" +
				(((j=d.getMinutes())<10)? "0"+j : j);
			}
			//else
			//  sansHeure == true donc :
			return (((j=d.getDate())<10)? "0"+j : j) +" "+
				moisAbrev[ d.getMonth() ] + " "+ 
				d.getFullYear();
			
		}
		ayo.belleDateEtHeure = function( d, lang ) {
			if (d==undefined || d==null) d = new Date()
			var j
			if (lang=='en') {
				var j
				j = d.getDate()
				if (j==1) j = "1st";
				else if (j==2) j = "2nd"
				else j = j+"th";
				//
				return [ 
				moisEnglish[ d.getMonth() ] + " "+ 
				j + ", "+
				d.getFullYear()
				,
				(((j=d.getHours())<10)? "0"+j : j) + ":" +
				(((j=d.getMinutes())<10)? "0"+j : j) + ":" +
				(((j=d.getSeconds())<10)? "0"+j : j)
				];
			}
			return [ 
			(((j=d.getDate())<10)? "0"+j : j) +" "+
			moisFrancais[ d.getMonth() ] + " "+ 
			d.getFullYear()
			,
			(((j=d.getHours())<10)? "0"+j : j) + ":" +
			(((j=d.getMinutes())<10)? "0"+j : j) + ":" +
			(((j=d.getSeconds())<10)? "0"+j : j)
			];
		}
		ayo.sqlDateTime = function( d ) {
			if (d==undefined || d==null) d = new Date()
			var j
			return d.getFullYear() + "-" + (((j=(d.getMonth()+1))<10)? "0"+j : j) + "-" + (((j=d.getDate())<10)? "0"+j : j) + " " + 
			(((j=d.getHours())<10)? "0"+j : j) + ":" +
			(((j=d.getMinutes())<10)? "0"+j : j) + ":" +
			(((j=d.getSeconds())<10)? "0"+j : j);
		}

		//2017 juin 19 -- savoir qu'on quitte pour bloquer fenetre popup
		var byebyeonquitte = false;
		ayo.byebye = function() { byebyeonquitte = true }


		//NEW 2017 mars 02 --- picopistage very lowlevel, is sent ALONG at EACH request IF there is something to send
		//
		var lesPicosAccumules = []
		var picoChecked = 0
		ayo.picopisteCeci = function( pico ){
			var tims = Date.now().toString()
			//onsole.log( "picopisteCeci() ", tims, pico )
			lesPicosAccumules.push( tims+":"+pico )
		}
		ayo.yaBeaucoupDePicos = function() {
			var tot = lesPicosAccumules.length
			picoChecked += 1
			//onsole.log( "yaBeaucoupDePicos? ", tot, picoChecked )
			return ((tot > 20) || ((tot > 0) && (picoChecked > 333)))
		}
		
		// appellée par .send() ci-dessous
		// fonction locale privée...
		function sendPicopistage( allreq ) {
			if (lesPicosAccumules.length > 0) {
				picoChecked = 0
				//implode
				var lst = lesPicosAccumules
				lesPicosAccumules = []
				//send
				var picos = lst.join( ";" )
				//onsole.log( "picopistage à envoyer:", picos )
				//clear (empty list)
				allreq.add( picopisteurSeFoutDeLaReponse, { act:'picopiste', data:picos } )
			}
		}
		var picopisteurSeFoutDeLaReponse = {
			receive:function(d){ 
				//onsole.log( "picopistage réussi:", d ) 
			}
		}
		


		//doit être écrit dans index.php ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !!!!!!
		//donc, ce sont des variables globales i.e.   window.AALPHA


		ayo.is_connected = false
		
		


		ayo.installAnotherAnimLoader = function(  ) {
			console.warn("AYO.installAnotherAnimLoader() DEPRECATED");
		}
		

		var SESSY0
		
		ayo.newXHR = function(  ) {
			//
			var bigreq = { resp:{}, json:{}, increm:0 }
			bigreq.add = function( service, req ) {
				var that = this
				var i = that.increm + 1
				that.increm = i
				var code = "r" + i
				that.resp[ code ] = service
				that.json[ code ] = req
				//
			}
			bigreq.send = function() {
				var that = this
				//
				sendPicopistage( that )
				//
				return ayo.xhr( 
					//callback
					function( r ) { 
						ayo.callbackForAll( that.resp, r ) 
					}, 
					that.json 
				)
			}
			return bigreq;
		}
		
		ayo.skipped_updates = []
		
		ayo.change_connect = function( is_connected, is_trusted ) {
			var wasConnected,wasTrusted
			wasConnected = this.is_connected
			wasTrusted = this.is_trusted
			//
			this.is_connected = is_connected
			this.is_trusted = is_trusted
			//
			if ((this.is_connected != wasConnected) || (this.is_connected && (this.is_trusted != wasTrusted))) {
				if (typeof this.avertirImmediatement == 'function') this.avertirImmediatement( is_connected, is_trusted )
			}
		}
		
		//var lastReceived = 0.0
		
		ayo.errorShowoffToTheUser = null
		ayo.userLevel = 0
		
		ayo.pleaseReloadHandler =  null

		ayo.callbackForAll = function( resp, r ) {
			//onsole.log( r.readyState+" / "+r.status )
			if (r.readyState == 4) {
				if (r.status < 0) {
					var errorcallback = this.errorShowoffToTheUser
					if (errorcallback && (typeof errorcallback == "function")) {
						errorcallback( "receive empty", r.status )
					}
					else {
						console.warn("We should tell something to the user!");
					}
					return //------------------------------------------------------>RETURN
				}
				if (r.status == 200) {

					var asObject,asPlain, lettre1,reste, newWindoName,dataForWindo;

					asPlain = r.responseText

					try {
						asObject = JSON.parse( asPlain );
					} catch(err) {
		                //this.error = new Error('Error trying to parse loaded json:', e);
						ayo.lastXHRerror = err
						console.log( "ayo.XHR error... ", err )
						asObject = null
		            }

					//onsole.log( "SESSYO STORAGE", SESSYO )
					this.setCookie( 'SESSY0', SESSYO )

					if (asObject==null) {
						console.log( "r.responseText : ",r.responseText )
						console.log( "serveur nous a renvoyé de la junk!\n\n");
						//POUR AVOIR ACCES AUX VARIABLES DANS LE DEBOGGEUR : errerr();
						//
						var errorcallback = this.errorShowoffToTheUser
						if (errorcallback && (typeof errorcallback == "function")) {
							errorcallback( "receive", r.responseText )
						}
						return //------------------------------------------------------>RETURN
					}


					this.userLevel = asObject.userLevel;
					if (isNaN(this.userLevel)) this.userLevel = 0
					this.change_connect( (asObject.is_connected || false), (asObject.is_trusted || false) )

					//----2018 07 30 juillet -- simplier reload new version
					var new_app_version = asObject.new_app_version
					if (app_version != new_app_version) {
						console.log("new version available :", new_app_version, " --vs-- ", app_version);
						if (app_version && new_app_version) {
							if (ayo.pleaseReloadHandler) ayo.pleaseReloadHandler();
							app_version = new_app_version;
						}
					}

					//----checking current app & lib versions VS when we were loaded
					/*
					var current_paths = asObject.version_app
					if ((current_paths != null) && (!byebyeonquitte) && (!window.ressource_site)) {
						var qtynew = 0
						var hash_version = ''
						var i,tot,curf,oldf, cp,op
						for (cp in current_paths) {
							oldp = app_paths[ cp ]
							if (oldp!=null) {
								curf = current_paths[ cp ]
								if (curf != oldp) {
									qtynew += 1;
									hash_version += curf
								}
							}
						}
						var deja
						if (qtynew>0) {
							deja = this.skipped_updates.indexOf( hash_version )
							if (deja<0) {
								this.skipped_updates.push( hash_version )
								alert( "Nouvelle version du logiciel disponible!! ("+hash_version+")\nVeuillez faire Reload dans votre fureteur. Votre session actuelle sera conservée.")
							}
							else {
								//konsole.log("HELLO ::: On a deja averti pour cette nouvelle version, on n'embête plus ("+hash_version+")")
							}
						}
						else {
							//konsole.log("HELLO ::: Reçu version du logiciel : pas de changement!")
						}
					}
					*/
					//

					var dataReceived = asObject.dataReceived
					var a_service, stuff_received, code

					if (typeof dataReceived == "object") for (code in resp) {
						//if (!resp.hasOwnProperty(code) || !dataReceived.hasOwnProperty(code)) continue;
						if (!dataReceived.hasOwnProperty(code)) continue;
						a_service = resp[code]
						stuff_received = dataReceived[code]
						//debug for dev
						//if (stuff_received.ok != 'ok') console.log( stuff_received )
						//
						if (typeof a_service.receive == "function") a_service.receive( stuff_received ) // { ok:..., error:..., dataReturned:... }
					}
					else {
						console.log("ERREUR dataReceived est PAS UN OBJET?", asObject )
					}
				}
			} 
			else {
				//konsole.log( r )
				for (code in resp) {
					if (!resp.hasOwnProperty(code)) continue;
					a_service = resp[code]
					if (typeof a_service.listen == "function") a_service.listen( r ) // { ok:..., error:..., dataReturned:... }
					/////if (a_service.hasOwnProperty('listen')) a_service.listen( r )
				}
			}
		}

		

		/**-----------------------------------------------
		 * XMLHttpRequest Wrapper Object
		 * @copyright Fiji Web Deisgn, GNU/GPL
		 * @author gabe@fijiwebdesign.com
		 * @url www.fijiwebdesign.com
		 * @version 0.1

		  adapted for require.js
		  + beaucoup reduite/simplifiée
		  2015-02-19 A.Ayotte
		  fiji ---> changed to ---> ayo
		 */

		/*
		quick&dirty standalone version, no require.js
		*/
		/*
		var ayoXHR = function( callback, json, url ) {
			var xhr = getXHR();
		    if ((!xhr) || (xhr==null)) { callback( {readyState:4, status:-99} ); return false }
			//-------------------------------------
		    xhr.onreadystatechange = function( ) {
				callback( this ) //was xhr
		    }
			xhr.open( "POST", url, true ); //toujours POST, toujours ASYNCH
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.setRequestHeader("Method", "POST " + url + " HTTP/1.1");
			
			xhr.onerror = function(ev) {
				ayo.lastXHRerror = ev.target.status
				console.log( "ayo.XHR error!!! ", ev.target )
			}
			var data = JSON.stringify( json )
			try {
				xhr.send(data);
			} catch(err) {
 				console.log( "ayoXHR error!!! ", err )
				return false
            }
			return true
		}
		*/
		
		ayo.lastXHRerror = null
		ayo.xhr = function( callback, json ) {
			var url
			//2017 juin 23 -- pouvoir se connecter à ayo.php sur un autre serveur (Cross Site!)
			if (window.ressource_site) url = window.ressource_site + "ayo.php";
			else url = "ayo.php" 
			// on force quel script on appelle!!!! goulot d'étranglement
			//onsole.log("ayo.xhr, url:", url)
			//
			if (
						(callback && (typeof callback == "function")) && 
						(json && (typeof json == "object"))
				) {
				var xhr = getXHR();
			
			    if ((!xhr) || (xhr==null)) return callback( { readyState:4, status:-99 } );
				//-------------------------------------
			    xhr.onreadystatechange = function( ) {
					callback( this ) //was xhr
			    }
			
				xhr.open( "POST", url, true ); //toujours POST, toujours ASYNCH
				xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
				xhr.setRequestHeader("Method", "POST " + url + " HTTP/1.1");
				
				xhr.onerror = function(ev) {
					ayo.lastXHRerror = ev.target.status
					console.log( "ayo.XHR error!!! ", ev.target )
				}
				
				
				//----------SESSYO
				var data, asCrypt, asAYON, deuxlignes
				
				deuxlignes = [ (SESSY0 ? (quiestla+':'+SESSY0) : ':'), json ];

				asCrypt = JSON.stringify( deuxlignes );
				
				// %%00%%00%%
				data = SESSYO+"%%00%%00%%"+asCrypt;
				//----------SESSYO
				
				//function xhr_send( data ) {
				//	for(var k=0;k<1000000;k++) {}
				//	throw "testing bad sending";
				//}
				//
				//onsole.log('XHR is sending:',data);
				var thirdsAcharm = 3, ok;
				for( ; thirdsAcharm > 0 ; ) {
					ok = true;
					try {
						xhr.send( data );
					} 
					catch(err) {
						ok = false;
						ayo.lastXHRerror = err;
						console.log( "ayo.XHR error!!! ("+thirdsAcharm+")", err );
						for(var k=0;k<10000000;k++) {}
						thirdsAcharm --;
					}
					if (ok) break;
				}
				if (!ok) {
					callback( { readyState:4, status:-9999 } );
					return false
	            }
			    return true;
			}
			else {
				callback( { readyState:4, status:-777 } );
				return false;
			}
		}
		
		/**
		 * @static xhr_ie_activex
		 * Holds IE6- XHR ActiveX version
		 */
		var xhr_ie_activex = false;

		function getXHR() {
			if (window.XMLHttpRequest) {
		        return new XMLHttpRequest();
		    } 
			else if (window.ActiveXObject) {
		        if (xhr_ie_activex) {
		            return new ActiveXObject( xhr_ie_activex );
		        } else {
				    var axs = [
						"Msxml2.XMLHTTP.6.0", 
						"Msxml2.XMLHTTP.5.0", 
						"Msxml2.XMLHTTP.4.0", 
						"MSXML2.XMLHTTP.3.0", 
						"MSXML2.XMLHTTP",
						"Microsoft.XMLHTTP"
					];
					for (var i = 0; i < axs.length ; i++) {
						try {
							var xhr = new ActiveXObject(axs[i]);
							if (xhr) {
								xhr_ie_activex = axs[i];
								return xhr;
								break;
							}
						}
						catch (e) {/* next */}
					}
		        }
		    }
			console.log("AYO-JS :::: erreur getXHR()--> NULL ???")
			return null;
		};
		/*-----------------fin FIJI code------------------*/



		window.SHIMCL = function( obj ) {
			if (obj.classList) return
			obj.classList = {
				add: function( newOne ){
					obj.className += newOne
				},
				remove: function( badOne ) {
					obj.className = obj.className.replace(badOne,"");
				}
			}
		} 


		// 2017 sept 06
		// patch pour forcer readonly sur database.js et edit.js
		ayo.NOCHDB = false //valeur inversee...true = "pas touche" ... tantpis



		ayo.cookie_prefix = cookie_prefix

		//2017 aout 30 -- ajout de "premanentStorage" aka localStorage
		ayo.setCookie = function(cname, cvalue, asPerm) {
			if (asPerm) localStorage.setItem( cname, cvalue )
			else sessionStorage.setItem( cname, cvalue )
		}
		ayo.getCookie = function(cname) {
			var p = localStorage.getItem( cname )
			if (p!=null) return p
			return sessionStorage.getItem( cname )
		}


		var toujoursLaMemeDate = new Date();
		ayo.setREALCookie = function(cname, cvalue, exhours) {
		    var d = toujoursLaMemeDate
			//d = new Date();
		    //d.setTime(d.getTime() + (exdays*24*60*60*1000)); ---- now() : en milli secondes!
		    d.setTime(Date.now() + (exhours*60*60*1000));
		    var expires = "expires="+d.toGMTString();
		    document.cookie = ayo.cookie_prefix+cname + "=" + cvalue + "; " + expires;
		}

		ayo.getREALCookie = function(cname) {
		    var name = ayo.cookie_prefix+cname + "=";
		    var ca = document.cookie.split(';');
		    for(var i=0; i<ca.length; i++) {
		        var c = ca[i].trim();
		        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
		    }
		    return "";
		}

		//SHIM pour s'assurer que la fonction .now() existe...
		if (!Date.now) {
		  Date.now = function now() {
			var d = new Date()
		    return d.getTime()
		  }
		}
		function getNow() {
			return Date.now()
		}
		ayo.getNow = getNow
	
		ayo.doEachFrame = function( msBTWNfrm, callMePlease ) {
			var now,last,diff,eachfrm,rest
			last = getNow()
			eachfrm = msBTWNfrm
			var gimmeAnAnimationFrame = window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame    ||
				window.oRequestAnimationFrame      ||
				window.msRequestAnimationFrame     ||
				function(what) { 
					window.setTimeout(what, eachfrm);
					//what() 
				};
				
			function oneFrame() {
				now = getNow()
				diff = now - last
				if (diff >= eachfrm) {
					//
					callMePlease( last, now, diff )
					//
					//on inclut le temps perdu dans ce IF
					//et diminuer le next frm delay
					now = getNow()
					diff = now - last
					if (diff > msBTWNfrm)
						eachfrm = (msBTWNfrm - (diff % msBTWNfrm))
					else
						eachfrm = msBTWNfrm
					last = now
				}
				gimmeAnAnimationFrame( oneFrame )
			}
			gimmeAnAnimationFrame( oneFrame )
		}
		
		
		
		ayo.findInAttributes = function( elem, those ) {
			var attr_keys, attr_vals, attr
			
			if (elem.attr_keys != null) {
				attr_keys = elem.attr_keys
				attr_vals = elem.attr_vals
				//onsole.log("faster!")
			}
			else {
				attr = elem.attributes
				//
				attr_keys = []
				attr_vals = []
				var i,tot,thing
				tot = attr.length
				for(i=0; i<tot; i++) {
					thing = attr[i]
					attr_keys.push( thing.name )
					attr_vals.push( thing.value )
					//				if (thing.name == that) return thing.value
				}
				elem.attr_keys = attr_keys
				elem.attr_vals = attr_vals
			}
		    for (var k in those) {
		        if (!those.hasOwnProperty(k)) continue;
				if ((i = attr_keys.indexOf( k )) > -1) those[k] = attr_vals[i]; //// WOW!
		    }
			return those
		}
		
		//my own semi-polyfill
		if (window["addEventListener"] == undefined) {
			window.addEventListener = function( eventName, callback, useCapture ) {
				window.attachEvent( "on"+eventname, callback, useCapture )
			}
		}
		else console.log("this browser is recent, cool!");
		
		
		// https://developer.mozilla.org/en-US/docs/Web/Events/wheel#Browser_compatibility
		//
		// creates a global "addWheelListener" method
		// example: addWheelListener( elem, function( e ) { console.log( e.deltaY ); e.preventDefault(); } );
		var zozo = function(window,document) {

		    var prefix = "", _addEventListener, support;

		    // detect event model
		    if ( window.addEventListener ) {
		        _addEventListener = "addEventListener";
		    } else {
		        _addEventListener = "attachEvent";
		        prefix = "on";
		    }

		    // detect available wheel event
		    var support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
		              document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
		              "DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

		    window.addWheelListener = function( elem, callback, useCapture ) {
		        _addWheelListener( elem, support, callback, useCapture );

		        // handle MozMousePixelScroll in older Firefox
		        if( support == "DOMMouseScroll" ) {
		            _addWheelListener( elem, "MozMousePixelScroll", callback, useCapture );
		        }
		    };

		    function _addWheelListener( elem, eventName, callback, useCapture ) {
		        elem[ _addEventListener ]( prefix + eventName, (support == "wheel") ? callback : function( originalEvent ) {
		            !originalEvent && ( originalEvent = window.event );

		            // create a normalized event object
		            var event = {
		                // keep a ref to the original event object
		                originalEvent: originalEvent,
		                target: originalEvent.target || originalEvent.srcElement,
		                type: "wheel",
		                deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
		                deltaX: 0,
		                deltaY: 0,
		                deltaZ: 0,
		                preventDefault: function() {
		                    originalEvent.preventDefault ?
		                        originalEvent.preventDefault() :
		                        originalEvent.returnValue = false;
		                }
		            };

		            // calculate deltaY (and deltaX) according to the event
		            if ( support == "mousewheel" ) {
		                event.deltaY = - 1/40 * originalEvent.wheelDelta;
		                // Webkit also support wheelDeltaX
		                originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
		            } else {
		                event.deltaY = originalEvent.detail;
		            }

		            // it's time to fire the callback
		            return callback( event );

		        }, useCapture || false );
		    }
		}
		zozo(window,document);
		zozo = null
		
		
		ayo.strips_tag = function( input, allowed ) {
			//  discuss at: http://locutus.io/php/strip_tags/
			allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('')
			var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
			var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi

			return input.replace(commentsAndPhpTags, '').replace(tags, 
				function ($0, $1) {
					return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
				}
			)
		}
		
		
		//sytufra
		window.spinnerHTML = function() {
			return "<div class='div4spinner'><i class='fa fa-spinner fa-pulse'></i></div>";
		}
		window.minispinnHTML = function() {
			return "<i class='fa fa-spinner fa-pulse'></i>";
		}
		
		
		
		return ayo
	}
)
