/**
 * @license
 * formkit.js - 10/08/2016
 * Copyright (c) 2016, Alexandre Ayotte
 *
 * code is licensed under the MIT License.
 * http://www.opensource.org/licenses/MIT
 */

define( 
	[ 'libayo/lang', 'libayo/ayo' ],
	function( LANG, AYO ) {
		var formkit = {}
		
		inputKits = {}
		formkit.registerKit = function( newId, newKit ) {
			inputKits[ newId ] = newKit 
		}
		formkit.whichKit = function( kitId ) {
			return inputKits[ kitId ]
		}


		
		function validationSommaire( idKit, check, val, kit ) {
			if (check===false) return true
			if (Array.isArray(check)) {
				if (check[0]=="same") {
					var k = check[1]
					if (val != kit.values[k]) return "notsame"
					return true
				}
				return true
			}
			if (check=="notempty") {
				if ((val==null) || (val==undefined) || (val == "")) return "empty"
				return true
			}
			if (check=="email") {
				var empty
				if (kit.tolerateEmpty) { empty = true; } // if empty then ok no error
				else { empty = "empty"; } // if empty then this error
				//
				// if empty, don't check further below...
				if ((val==null) || (val==undefined) || (val == "")) return empty;
				//
				//
				var mcx,tot,points
				mcx = val.split("@")
				tot = mcx.length
				if (tot < 2) return "manq(@)"
				if (tot > 2) return "trop(@)"
				points = mcx[1].split(".")
				tot = points.length
				if (tot < 2) return "manq(.)"
				return true
			}
			return true
		}
		formkit.validationSommaire = validationSommaire
		
		
		function generalFilterFields( ev, forceEnter ) {
			//onsole.log( "FORM ELEMENT  : ",  ev )
			var elem = ev.target || ev.srcElement
			//
			//if (forceEnter) console.log( "...attributes : ",  elem.attributes )
			//onsole.log( "ayoFilterKey : ", ev.keyCode )
			var isTab = (ev.keyCode == 9)
			var isEnter = ((ev.keyCode==10) || (ev.keyCode==13) || (forceEnter===true))
			
			if (isTab || isEnter) {
				var idKit
				idKit = AYO.findInAttributes( elem, { inputkit:null } ).inputkit ///TROP HOT!!!

				//onsole.log( "idKit:", idKit )
				if ((idKit == null) || (idKit == undefined)) return true; //let the system go normal...

				var kit, curid, flds
				curid = elem.id
				kit = formkit.whichKit( idKit )
				//
				//onsole.log( "kit:", kit )
				flds = kit.fields

				var k, qty
				qty = flds.length
				k = flds.indexOf( curid )

				if (k<0) return true //this field is not listed in the kit ??
				//===============================
				//onsole.log( ".....ELEMENT id : "+  elem.id + " ...found at: "+k )
				
				var validFunc, sendFunc, errorMessagesFunc
				validFunc = kit.validFunc
				sendFunc = kit.sendFunc
				errorMessagesFunc = kit.errorMessagesFunc

				var nxt,  onefld, curfld,errfld,  key, alltrue, chk, chks, valids, v, tabs,pp,  curvalue, toleranceAuVide
				tabs = kit.tabs
				chks = kit.checks
				qty = tabs.length
				k = k+1
				if (k>=qty) k = 0; //on tourne
				nxt = tabs[k]
				
				toleranceAuVide = (kit.tolerateEmpty === true)
				//onsole.log( "toleranceAuVide:", toleranceAuVide )
				
				valids = []

				if (isEnter) {
					var i
					curfld = null
					errfld = null
					alltrue = 0
					for(i=0; i<qty; i++) {
						key = tabs[i]
						onefld = document.getElementById( key )
						if (onefld==null || onefld==undefined) {
							valids.push( true )
							continue
						}
						chk = chks[i]
						curvalue = onefld.value
						if (validFunc != null) v = validFunc( key, chk, curvalue, kit )
						else v = true
						
						valids.push( v )
						if (v === true) alltrue += 1
						//
						if (key == curid) curfld = onefld
						//
						// mettre à jour pour chacun l'état "warning"
						pp = onefld.parentNode
						if (pp==null) continue //peu probeble?
						SHIMCL(pp)
						
						//onsole.log(i, pp)
						if ((v===true) || (toleranceAuVide && (v == 'empty'))) {
							kit.values[i] = curvalue
							pp.classList.remove("has-warning")
						}
						else {
							kit.values[i] = ""
							pp.classList.add("has-warning")
							if (key == curid) errfld = onefld
						}
						//pp = onefld.nextSibling
						//onsole.log("nextSibling", pp)
						//if (v===true) pp.classList.add("hideinfo")
						//else pp.classList.remove("hideinfo")
						
					}
					if (alltrue == qty) {
						if (curfld != null) curfld.blur()
						kit.allValid = true
						if (sendFunc!=null) sendFunc( kit )
					}
					else {
						kit.allValid = false
						if ((qty==1) || (errfld != null)) {
							//on fait rien, c'est le champ actuellement au focus qui est fautif
							//onsole.log("PAS DE CHANGE FOCUS!")
						}
						else {
							for(i=0; i<qty; i++) {
								v = valids[i]
								if (v !== true) nxt = tabs[i]
							}
							curfld = document.getElementById( nxt )
							curfld.focus()
						}
						if (errorMessagesFunc!=null) errorMessagesFunc( kit, tabs, valids )
					}
					//onsole.log( "chks:", chks )
					//onsole.log( "valids:", valids )
				}
				else if (isTab) {
					//onsole.log( "...isTAB!!", nxt )
					curfld = document.getElementById( nxt )
					curfld.focus()
				}
				//
				ev.preventDefault()
				return false
			}
			return true
		}
		window.generalFilterFields = generalFilterFields
		
		
		formkit.loginKit = function( kit, generalFilterFieldsFUNC, fontsz ) {
			var email_id, psswd_id, flds, txtEmail, txtMtpss, txtOK
			flds = kit.fields
			email_id = flds[0]
			psswd_id = flds[1]
			ok_id = flds[2]
			
			if (fontsz == undefined || fontsz == null) fontsz = " font-size:19px;";
			
			if (typeof generalFilterFieldsFUNC != "string") generalFilterFieldsFUNC = "generalFilterFields"
			
			txtEmail = LANG.trad( "courriel", "Courriel" )
			txtMtpss = LANG.trad( "mtpss", "Mot de passe" )
			txtOK =    LANG.trad( "entrer", "Entrer" )
			
			var sty = " style='margin-bottom:3px;'"
			//  has-feedback
			return "<div class='input-group margin-bottom-sm' "+sty+">"+
			  "<span class='input-group-addon'><i class='fa fa-envelope-o fa-fw' aria-hidden='true'></i></span>"+
			  "<input class='form-control' type='email' autocomplete='off' autocapitalize='off' placeholder='"+txtEmail+"' style='"+fontsz+"' "+ 
					"id='"+email_id+"' inputkit='"+kit.id+"' onkeydown='"+generalFilterFieldsFUNC+"(event)'>"+
					// xxontouchstart='this.focus();return true' xxonmousedown='this.focus();return true'
			  //"<i class='fa fa-warning fa-fw form-control-feedback hideinfo' aria-hidden='true'></i>"+
			"</div>"+
			"<div class='input-group margin-bottom-sm' "+sty+">"+
			  "<span class='input-group-addon''><i class='fa fa-key fa-fw' aria-hidden='true'></i></span>"+
			  "<input class='form-control' type='password' autocomplete='off' autocapitalize='off' placeholder='"+txtMtpss+"' style='"+fontsz+"' "+ 
					"id='"+psswd_id+"' inputkit='"+kit.id+"' onkeydown='"+generalFilterFieldsFUNC+"(event)'>"+
			  //"<i class='fa fa-warning fa-fw form-control-feedback hideinfo' aria-hidden='true'></i>"+
			"</div>"+
			"<div class='input-group' id='nptgrp_"+ok_id+"'>"+
			  "<a role='button' class='btn btn-default' "+
				"style='margin-left:45px;"+fontsz+"' "+
				"id='"+ok_id+"' inputkit='"+kit.id+"' onclick='"+generalFilterFieldsFUNC+"(event, true)'>"+
			  "<i class='fa fa-user fa-fw'></i> "+txtOK+"</a>"+
			"</div>";
			//+
			//"</div>"
		}
		formkit.loginKitTBL = function( kit, generalFilterFieldsFUNC ) {
			var email_id, psswd_id, flds, txtEmail, txtMtpss, txtOK
			flds = kit.fields
			email_id = flds[0]
			psswd_id = flds[1]
			ok_id = flds[2]
			
			if (typeof generalFilterFieldsFUNC != "string") generalFilterFieldsFUNC = "generalFilterFields"
			
			txtEmail = LANG.trad( "courriel", "Courriel", null, true )
			txtMtpss = LANG.trad( "mtpss", "Mot de passe", null, true )
			txtOK =    LANG.trad( "entrer", "Entrer", null, true )
			
			var s = ""
			s+= "<table class='login_table' border=0><tr>";
			s+="<td class='login_td login_tdicon'><i class='fa fa-envelope-o fa-fw' aria-hidden='true'></i></td>";
			s+="<td class='login_td'><input class='login_field onlyClick' type='email' autocomplete='off' autocapitalize='off' placeholder='"+txtEmail+"' "+ 
					"id='"+email_id+"' inputkit='"+kit.id+"' onkeydown='"+generalFilterFieldsFUNC+"(event)'></td>";
			s+="</tr><tr>";
			s+="<td class='login_td login_tdicon'><i class='fa fa-key fa-fw' aria-hidden='true'></i></td>";
			s+="<td class='login_td'><input class='login_field onlyClick' type='password' autocomplete='off' autocapitalize='off' placeholder='"+txtMtpss+"' "+ 
					"id='"+psswd_id+"' inputkit='"+kit.id+"' onkeydown='"+generalFilterFieldsFUNC+"(event)'></td>";
			s+="</tr><tr>";
			s+="<td></td>";
			s+="<td><a role='button' class='login_button' "+
				"id='"+ok_id+"' inputkit='"+kit.id+"' onclick='"+generalFilterFieldsFUNC+"(event, true)'>"+
			  "<i class='fa fa-user fa-fw'></i> "+txtOK+"</a></td>";
			
			//  
			return s;
		}
		

		return formkit
	}
)
