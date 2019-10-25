/**
 * @license
 * ayo_gate_pp.js - v0.1.0
 * Copyright (c) 2016, Alexandre Ayotte
 *
 * this code is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */

define( 
	['libayo/ayo', 'appcode/login', 'libayo/database'],
	function( AYO, LOGIN, DB ) {
			
		var application = {}

		var t=0;
		var splashScreen, groupinterieur
		
		application.start = function() {
			var unDIV
			//unDIV = document.getElementById( "contenu" )
			//unDIV.addEventListener( "click", EDIT.clickOnSomething );
			//unDIV.addEventListener("keydown", EDIT.clickOnSomething);  POURQUOI ??
			
			unDIV = document.getElementById( "appName" )
			unDIV.innerHTML = cookie_prefix + DB.installManyAnimLoader( 8 )
			unDIV = document.getElementById( "appVersion" )
			unDIV.innerHTML = app_version
			
			var attendre = 0
			var bienvenueVisible = true
			var notsent = true

			splashScreen = document.getElementById( "vitrine" );   SHIMCL(splashScreen)
			groupinterieur = document.getElementById( "groupinterieur" );  // SHIMCL(groupinterieur)

			function workLoad() {
				var pv
				if (AYO.is_connected) {
					// on SUBMIT le form pour quitter cet index.php
					attendre = 99
					if (notsent) {
						var fld_sessyoid = document.getElementById( "FLD_SESSYOID" );
						fld_sessyoid.value = SESSYO;
						var form_sessyoid = document.getElementById( "FORM_SESSYOID" );
						form_sessyoid.submit()
						//
						notsent = false
						console.log("****\n on SUBMIT le form pour quitter cet index.php \n****")
					}
				}
				if (bienvenueVisible) {
					attendre += 1
					if (attendre > 2) {
						bienvenueVisible = false
						splashScreen.classList.add("displaynone")
					}
				}
			}
			AYO.doEachFrame( 500, workLoad )

			LOGIN.usagerNonidentifiePermis = false
			LOGIN.installYourself( "porte", "userInfoLineAndDisconnectBtn", null, false );
			
			//2019 05 22 mai -- bug ayo_gate because many endpoints in same domain -- pas entièrement réglé cependant... :-/
			//console.log( window.location )
			var href = window.location.href
			console.log(" NOUS RELOADERONS CECI: ", href )
			
			groupinterieur.innerHTML = "<form id=FORM_SESSYOID method=POST action='"+href+"'><input id=FLD_SESSYOID type=HIDDEN name=SESSYOID value=''></form>";
			//groupinterieur.innerHTML = "<form id=FORM_SESSYOID method=POST action='./'><input id=FLD_SESSYOID type=HIDDEN name=SESSYOID value=''></form>";
			}

		return application
	}
)
