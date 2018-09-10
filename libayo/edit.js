/**
 * @license
 * edit.js - v0.1.0
 * Copyright (c) 2016, Alexandre Ayotte
 *
 * code is licensed under the MIT License.
 * http://www.opensource.org/licenses/MIT
 */

define( 
	[ 'libayo/ayo', 'libayo/html', 'libayo/database', 'libayo/helpers' ],
	function( AYO, HTML, DB, HELPERS ) {
		var editsys = {}
		
		function consolelog() {}


		function reallyDeleteRecord( record_reference ) {
			var parts
			parts = record_reference.split(".")

			var view = DB.whichView( parts[0] )
			if (view && view.deleteOneRecord && view.deleteOneRecord( parts[1], parts[2] )) {
				//
				view.forceRefresh()
				//
			}
		}

		function deleteRecord( btn, ev, record_reference ) {
			btn.blur()
			//onsolelog( ev )
			//onsole.log( "DELETE RECORD:", record_reference )
			if (editsys.deleteDialog) {
				showConfirmDelete( btn, record_reference )
			}
			else {
				reallyDeleteRecord( record_reference )
			}
		}
		//pour la touche RETURN
		function addRecord_internal( view ) {
			if (view && view.addEmptyRecord && view.addEmptyRecord( )) {
				//
				//onsole.log(":::::forceRefresh()")
				view.forceRefresh()
				//onsole.log(".....")
				//
				if (view.dern_rec_prem_cell_editable) {
					//onsole.warn("dern_rec_prem_cell_editable ---> ", view.dern_rec_prem_cell_editable)
					var elem = document.getElementById( view.dern_rec_prem_cell_editable )
					floatingFieldOpen( elem, view.viewName )
				}
				//?? view.dern_rec_prem_cell_editable = null
			}
		}
		function addRecord( btn, ev, thisView ) {
			if (btn) btn.blur()
			if (ev) consolelog( ev )
			consolelog( "ADD RECORD:", thisView )
			var view = DB.whichView( thisView )
			addRecord_internal( view )
		}
		window.deleteTableRecord = deleteRecord
		window.addTableRecord = addRecord

		window.reallyDeleteTableRecord = function( btn, ev ) {
			if (!editsys.deleteDialog) return
			btn.blur()
			var record_reference = editsys.willDeleteThisRecord
			//onsole.log("window.reallyDeleteTableRecord() : ", record_reference)
			reallyDeleteRecord( record_reference )
		}


		editsys.deleteDialog = null
		editsys.deleteDialogButton = null
		editsys.initConfirmDeleteDialog = function( whichDIV ) {
			var elem = document.getElementById( whichDIV )
			if (elem==null) {
				console.warn('initConfirmDeleteDialog, elem not found in HTML: ', whichDIV )
				return
			}
			SHIMCL(elem)
			editsys.deleteDialog = elem
			editsys.deleteDialog.innerHTML = HTML.insideConfirmDeleteDialog( whichDIV, "reallyDeleteTableRecord", "floatingConfirmDeleteClose" )
			editsys.deleteDialogButton = "CD_" + whichDIV
		}
		
		window.floatingConfirmDeleteClose = function() {
			var elem
			if (elem = editsys.deleteDialog) elem.classList.add("displaynone")
		}

		function showConfirmDelete( btn, record_reference ) {
			if (!editsys.deleteDialog) return
			if (typeof editsys.deleteDialogButton === 'string') {
				var elem
				elem = document.getElementById( editsys.deleteDialogButton )
				if (elem == null) return
				SHIMCL(elem)
				editsys.deleteDialogButton = elem
			}
				
			//trouver x,y PROCHE de btn
			var box = getPosition( btn )
			var sty = editsys.deleteDialog.style
			//onsole.log( "showConfirmDelete() box =", box )
			sty.left = (box.x - 24) +"px"
			sty.top = (box.y - 12)+"px"
			
			editsys.willDeleteThisRecord = record_reference
			//montrer le petit dialog par dessus le bouton delete
			editsys.deleteDialog.classList.remove("displaynone")
			editsys.deleteDialogButton.focus()
		}
		

		
		function clickOnSomething(ev) {
			//onsole.log(ev)
			var elem = ev.target || ev.srcElement
			if (elem==null || elem==undefined) return
			//
			var tag = elem.localName
			var capabilitees
			
			if (tag == "td") {
				capabilitees = AYO.findInAttributes( elem, { cell_mode:null, cell_view:null })
				//onsole.log( "EVENTonBODY", ev.type, tag, elem.id, capabilitees )
				//consolelog(ev)
				if (capabilitees.cell_mode == 'editable') floatingFieldOpen( elem, capabilitees.cell_view )
				//else
				//if (cell_capable.mode == 'selectable') selectThisCell( elem, cell_editMode.cell_view )
				//alert("OUCH "+capabilitees.cell_mode)
			}
			//else {
			//	alert( tag + " is not TD??" )
			//
			//}
		}
		editsys.clickOnSomething = clickOnSomething
		
		var lonelyField = {
			alwaysSaveValue : true, //like before
			enterLikeTab : false,
			//
			record_index: -1,
			//
			opened : false,
			inputtag : null,
			viewName : null,
			view: null,
			rec_id : null,
			cell_id : null
		}
		editsys.lastRecordEditedIndex = function() {
			return lonelyField.record_index
		}
		function floatingFieldResize( ev, fld ) {
			//onsole.log("after onChange")
			var sch = fld.scrollHeight
			if (fld.clientHeight < sch ) {
			    fld.style.height = (sch+1).toString()+"px";
			}
			var scw = fld.scrollWidth
			if (fld.clientWidth < scw ) {
			    fld.style.width = (scw+20).toString()+"px";
			}
		}
		function __KEYDOWNHANDLER(){}
		function floatingFieldFilter( ev, forceEnter ) {
			var fld = lonelyField.inputtag;
			//if (sENGINEon) {
			//	lonelyField.someIDcode = null //the user has to choose from the menu **OR** [todo] the perfect match is set
			//	sENGINE.tapee = fld.value
			//	console.log("sENGINE is On ["+fld.value+"]")
			//}
			//else console.log("sENGINE is OFF")
			
			var isTab = (ev.keyCode == 9);
			var isEnter = (
				(((ev.keyCode==10) || (ev.keyCode==13)) && (!lonelyField.isMultiline))
				|| 
				(forceEnter===true)
			);
			
			if (ev.keyCode == 27) {
				sENGINEon = false
				//
				lonelyField.acceptChanges = false;
				fld.blur();
			}
			else if (isTab || isEnter) {
				//var fld = lonelyField.inputtag
				//PAS TOUT DE SUITE!  fld.blur()

				var tot,i,t, rec_id, cell_varname, elem_id, elem
				var view, tabs, ri,ci, columnNames
				view = lonelyField.view
				
				if (isEnter && (!lonelyField.enterLikeTab)) {
					//
					lonelyField.acceptChanges = true
					
					ri = lonelyField.record_index
					ci = lonelyField.cell_index
					//onsole.log( "BEFORE : enter KEY ri=",ri, "ci=",ci )

					fld.blur()

					if (!lonelyField.isFromFilterLine) {
						ri = lonelyField.record_index
						ci = lonelyField.cell_index
							tot = view.someRecords.length
							if (ri >= (tot-1)) {
								//addrecord!
								if (view.enterKeyMode == 'nextOrNew') {
									//addRecord_internal( view ) 
									//ri += 1;    //ça ne fait pas le focus ci-dessous! ça le fait dedans??
									//---------soit on ajoute auto (cidessus), 
									//---------soit on retourne tout en haut:
									// console.warn("loop?", ri )
									// ri = -1 
									//---------soit on ferme le field:
									//
									ri = tot+1 
									//ri = 0
								}
								else {
									//---------soit on retourne tout en haut:
									// console.warn("loop?", ri )
									// ri = -1 
									//---------soit on ferme le field:
									// 
									ri = tot+1;
									//onsole.log( "------> loosing focus on elem  ci:", ci )
								}
							}
							if (ri < (tot-1)) {
								ri += 1
								//onsole.log("next ri =", ri )
								lonelyField.record_index = ri
								rec_id = view.someRecords[ri][0]

								columnNames = view.columnNames
								cell_varname = columnNames[ci]
								elem_id = rec_id+"."+cell_varname+".!."+ci+"."+view.viewName

								//onsole.log( "------> trying to focus on elem  :", elem_id )
								elem = document.getElementById( elem_id )

								if (elem != null) floatingFieldOpen( elem, lonelyField.viewName )
								//else console.warn("eleme == null..... elem_id = ", elem_id ,'ci=', ci, 'columnNames', columnNames )
								 
							}
					}
				}
				else {
					// c'est un tab
					lonelyField.acceptChanges = true
					fld.blur()
					
					if (!lonelyField.isFromFilterLine) {
						ci = lonelyField.cell_index
						columnNames = view.columnNames
						tabs = view.tabs

						//onsole.log( "....record :", lonelyField.record )
						//onsole.log( "....columnLooks:", view.columnLooks )
						//
						//onsole.log( "....tabs   :", tabs )
						//onsole.log( "....record_index    :", ri )
						//onsole.log( "....cell_inrecord   :", lonelyField.cell_inrecord )
						//onsole.log( "....cell_index   :", ci )

						tot = tabs.length
						t = -1
						if (ci > -1) for (i=0; i<tot; i++) {
							if (tabs[i] == ci) t = i
						}
						else t = 0
						//
						//
						//onsole.log( "....in tabs   :", t )
						if (t>-1) {
							if (ev.shiftKey) t -= 1
							else t += 1
							if (t<0) t = tot-1
							else if (t >= tot) t = 0
							ci = tabs[t]
							cell_varname = columnNames[ci]
							rec_id = lonelyField.rec_id
							elem_id = rec_id+"."+cell_varname+".!."+ci+"."+view.viewName
							//
							//onsole.log( "------> trying to focus on elem  :", elem_id )
							elem = document.getElementById( elem_id )

							if (elem) floatingFieldOpen( elem, lonelyField.viewName )
						}
					}
					
				}
				ev.preventDefault()
			}
			else {
				//onsole.log("after keypress")
				var sch = fld.scrollHeight
				if (fld.clientHeight < sch ) {
				    fld.style.height = (sch+1).toString()+"px";
				}
				var scw = fld.scrollWidth
				if (fld.clientWidth < scw ) {
				    fld.style.width = (scw+20).toString()+"px";
				}
			}
			//else console.log("ev.keyCode = ",ev.keyCode)
		}
		function getPosition( elem ) {
		    // (1)
		    var box = elem.getBoundingClientRect()

		    var body = document.body
		    var docElem = document.documentElement

		    // (2)
		    var scrollTop = docElem.scrollTop || body.scrollTop || 0
		    var scrollLeft = docElem.scrollLeft || body.scrollLeft || 0
		    //var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop || 0
		    //var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft || 0

		    // (3)
		    var clientTop = docElem.clientTop || body.clientTop || 0
		    var clientLeft = docElem.clientLeft || body.clientLeft || 0

		    // (4)
		    var top  = box.top +  scrollTop - clientTop
		    var left = box.left + scrollLeft - clientLeft
			var bottom = box.bottom +  scrollTop - clientTop
			var right = box.right + scrollLeft - clientLeft

			//consolelog(top, left)
			
		    return { y: Math.round(top), x: Math.round(left), w:right - left, h:bottom-top }
		}

		
		//refactory: EDIT connait maintenant HELPERS, 
		// à cause de la fouine / livesearch, on vas pouvoir tisser plus serré ces deux là
		// DONC plus besoin de définir EDIT.getHelper, EDIT showHelper dans appMODULE.js
		//
		editsys.initFloatinghelperMenu = function( whichDIV ) {
			this.floatinghelperID = whichDIV
			floatinghelperDIV = null
			prepFloatinghelperDIV()
		}
		editsys.floatinghelperID = "floatinghelper"
		var floatinghelperDIV = null
		function getPremadeMenuHelper( h ){
			if ((h != null) && HELPERS.menus.hasOwnProperty( h )) return HELPERS.menus[h]
			return null
		}
		function prepFloatinghelperDIV() {
			if (floatinghelperDIV != null) return true
			//
			floatinghelperDIV = document.getElementById( editsys.floatinghelperID )
			if (floatinghelperDIV==null) {
				//onsole.warn("floatinghelperID["+editsys.floatinghelperID+"] is not defined in HTML")
				return false
			}
			//
			SHIMCL(floatinghelperDIV)
			return true
		}
		function showPremadeMenuHelper( whichHelp ){
			var ceci
			if ((floatinghelperDIV==null) && (!prepFloatinghelperDIV())) {
				return
			}
			//
			if ((whichHelp != null) && HELPERS.menus.hasOwnProperty( whichHelp )) {
				ceci = HELPERS.menus[ whichHelp ]
				if (ceci.HTML) {
					floatinghelperDIV.innerHTML = ceci.HTML;
					//onsole.log("HELPERS:", whichHelp, ceci );
					floatinghelperDIV.classList.remove("displaynone");
				}
				else {
					//onsole.log("HELPERS missing HTML:", whichHelp, ceci );
					floatinghelperDIV.innerHTML = ''
					floatinghelperDIV.classList.add("displaynone")
				}
			}
			else {
				//if (0) {
					floatinghelperDIV.innerHTML = ''
					floatinghelperDIV.classList.add("displaynone")
				//}
				//
				//if (whichHelp != null) console.log("pas d'aide disponible pour: ["+whichHelp+"]"  )
			}
		}
		
		/////////////////////// 2017 sept 28 : livesearching while typing!
		editsys.liveSearchRefresh = function( forceHide ){
			if (!sENGINEon) return;
			if ((floatinghelperDIV==null) && (!prepFloatinghelperDIV())) {
				//onsole.log("??")
				return
			}
			if (forceHide===true) {
				floatinghelperDIV.innerHTML = ''
				floatinghelperDIV.classList.add("displaynone")
				return
			}
			if (sENGINE.completee > 0) {
				var liste = sFOUINE.resultats()
				
				if (liste.length > 0) {
					var view = sENGINE.currentView
					
					if (view.firstSearchIsExact && (lonelyField.someIDcod==null)) {
						var ic = view.columnNames.indexOf( view.idORcode )
						var rec = liste[0]
						//onsole.log( view.idORcode,"....first match is EXACT:",ic, rec)
						lonelyField.someIDcode = rec[ic]
					}
					
					var livemenu = HELPERS.prepareHTMLmenuAvecSomeRecords( view, liste, view.idORcode,sENGINE.columnToSearch, null, null )
					floatinghelperDIV.innerHTML = livemenu
					floatinghelperDIV.classList.remove("displaynone")
				}
				else {
					floatinghelperDIV.innerHTML = ''
					floatinghelperDIV.classList.add("displaynone")
				}
				
				if (sFOUINE.finie) {
					sENGINE.completee = 0
				}
			}
		}
		function __sENGINE(){}
		var sFOUINE = HELPERS.fouineuse
		var seeThisHistoire = false
		var sENGINEon = false
		var sENGINE = {
			tapee:null,
			precedente:null,
			completee:0,
			currentView:null,
			columnToSearch:null
		}
		function sENGINEisPaused( txtAccepted ) {
			sENGINE.tapee = sENGINE.precedente = txtAccepted
			sENGINE.completee = 0
			editsys.liveSearchRefresh( true )// hide menu
		}
		function sENGINEisRunning() {
			if (!sENGINEon) return;
			sENGINE.tapee = lonelyField.inputtag.value
			if (sFOUINE.finie) {
				if (sENGINE.tapee == sENGINE.precedente) {
					return
				}
			}
			if (sENGINE.tapee.length > 2) {
				if (sENGINE.tapee != sENGINE.precedente) {
					sENGINE.precedente = sENGINE.tapee
					lonelyField.someIDcode = null
					//
					//
					//onsole.log("recommence()2")
					sFOUINE.recommence( sENGINE.tapee, sENGINE.currentView, sENGINE.columnToSearch )
				}
				sENGINE.completee = sFOUINE.fouine()
			}
			else {
				//on devrait vider, mais le refresh le fera...
			}
		}
		var sENGINEfrm = setInterval( sENGINEisRunning, 15 )
		
		
		
		///////////////////////
		
		
		
		
		function floatingFieldLineOrRecordID( rec_id ) {
			var tot,i,r,someRecords
			someRecords = lonelyField.view.someRecords
			tot = someRecords.length
			for(i=0; i<tot; i++) {
				r = someRecords[i]
				//
				//console.log("...searching for:", rec_id, i, r)
				if (r[0] == rec_id) {
					lonelyField.record = r
					lonelyField.record_index = i
					//console.log( "YEAH!!! ....record in edition: ", i, r)
					return true
					//
					//
				}
			}
			lonelyField.record = null
			lonelyField.record_index = -1
			return false
		}
		
		
		
		
		function floatingFieldOpen( elem, viewName ) {
			
			var view = DB.whichView( viewName )
			//
			//
			//onsole.log( "------> trying floatingFieldOpen()   viewName:", viewName, view, "lonelyField.alwaysSaveValue=", lonelyField.alwaysSaveValue )
			
			if (view==null) {
				console.log("error: view==null ------> floatingFieldOpen()   elem,viewName:", elem, viewName )
				return
			}
			lonelyField.view = view
			
			var tot,i, cr,j, someHelp, cellclass

			var p = elem.id.split(".")
			var rec_id
			rec_id = p[0]
			
			lonelyField.opened = true
			lonelyField.acceptChanges = lonelyField.alwaysSaveValue
			lonelyField.isFromFilterLine = (rec_id == 'filter') || (view.actLikeAFilterLine === true)
			
			
			lonelyField.unique_cell_id = elem.id
			lonelyField.rec_id = rec_id
			lonelyField.cell_varname = p[1]
			
			j = (1 * p[3])
			if (view.column2record) cr = view.column2record[j]; else cr = j;
			
			
			var fld = lonelyField.inputtag

			//2017-juin-22
			if (view.columnHTMLs) lonelyField.htmlAccept = view.columnHTMLs[cr]
			else lonelyField.htmlAccept = (view.allowTAGS == true);//legacy
			//2017-juin-22
			if (view.columnMultilines) lonelyField.isMultiline = view.columnMultilines[cr]
			else lonelyField.isMultiline = false;

			//new 5juill2016 -- on prends le ClassCSS demandé! (et on le gardera pour le "perdre")
			if (cellclass = lonelyField.cellSpecialClass) {
				//oups: leftover?
				fld.classList.remove( cellclass )
			}
			lonelyField.cellSpecialClass = null
			//
			if (view.columnClasses) {
				if (cellclass = view.columnClasses[j]) {
					// PATCH
					cellclass += "_p3" //mega patch pcq le field est 3 px plus padding-inside que les cell (et ça depends de html!!!)  <WARNING>
					// PATCH ouch
					
					lonelyField.cellSpecialClass = cellclass
					fld.classList.add( cellclass )
				}
			}
			//
			//pourquoi record_index ET rec_index ???
			
			lonelyField.cell_inrecord = cr
			lonelyField.cell_index = j
			//
			lonelyField.viewName = viewName
			//
			lonelyField.record = null
			//
			if (!floatingFieldLineOrRecordID( rec_id )) {
				//onsole.warn( "WEIRD: did not find the rec_id ",rec_id, " in current someRecords of the view")
			}
			else {
				//signaling that a record starts in edition
				if (typeof view.selectCurrentRecord == "function") {
					view.selectCurrentRecord( rec_id, lonelyField.record_index, lonelyField.cell_inrecord, lonelyField.record )
				}
			}

			

			someHelp = view.columnLooks[j]
			var ch1 = someHelp.substring(0,1)

			//2016 aout 01 --- indirect menu selon valeur dans autre cellule!!!
			if (ch1 == '.') {
				//onsole.log( "YEAH!!! someHelp.substring(0,1) == '.' ", someHelp )
				var ppind = someHelp.split(' ')
				// 1
				// retrouver le indirect array dans le someHelp ppind[1]
				var nomMenuIndir = ppind[1].trim()
				//
				someHelp = getPremadeMenuHelper( nomMenuIndir )
				if (someHelp && someHelp.indirect) {
					//
					//onsole.log( "trouvé un autre menu HELP ayant indirect listing: ", nomMenuIndir, someHelp )
					// 2
					// retrouver la valeur (val) du champ qui sera la clé (key) pour savoir quel menu afficher (selon indirect[ val ])
					var indir_no = parseInt(ppind[2])
					if (!isNaN( indir_no ) && (lonelyField.record)) {
						if (view.column2record) indir_no = view.column2record[indir_no]
						var indir_val
						indir_val = lonelyField.record[ indir_no ].trim()
						//onsole.log("voici la valeur à trouver dans indirect listing:", indir_val)
						var doubleindirect
						doubleindirect = someHelp.vals.indexOf( indir_val )
						someHelp = someHelp.indirect[ doubleindirect ]
						//if (someHelp) console.log("GOT IT!! ",doubleindirect, someHelp )
					}
				}
			}
			else if ((ch1 == '*') || (ch1 == '!') || (ch1 == '_')) {
				someHelp = null
			}
			
			// si liveSearch, alors ch1 == '*', donc on ferme le menu [il apparait juste quand la valeur change ET si y a des choix]
			showPremadeMenuHelper( someHelp )
			

			var originalValue 
			// lonelyField.htmlAccept && 
			if (lonelyField.record) {
				originalValue = lonelyField.record[cr]
			}
			else {
				//
				//onsole.log("lonelyField IS FORCED TO USE VALUE IN HTML")
				originalValue = (elem.innerText || elem.textContent).trim()
			}
			
			//
			//onsole.log("lonelyField.originalValue=", originalValue )
			if (originalValue == null) originalValue = "";
			// BUG on n'a pas changé la valeur mais dans le input field NULL devient "" ... originalValue doit être ce qui est «affiché»
			
			lonelyField.originalValue = originalValue
			fld.value = originalValue
			
			
			sENGINEon = false     //block asynch stuff kriss [pas certain après autre correctif]
			
			///new live search A.K.A typingSearch
			lonelyField.liveSearch = (view.columnTypingSearch) ? view.columnTypingSearch[j] : null;
			if (lonelyField.liveSearch) {
				function __ICI__(){}
				// 
				var partsview,columnToSearch
				var choicesViewName = view.columnTypingChoices[j]
				if (choicesViewName) {
					partsview = choicesViewName.split(".")
					choicesViewName = partsview[0]
					if (partsview.length>1) {
						columnToSearch = partsview[1]
					}
					else {
						columnToSearch = null //chercher FR / EN
					}
				}
				var viewServingAsChoices
				if ((choicesViewName) && (viewServingAsChoices = DB.whichView( choicesViewName ))) {
					var ic
					ic = view.ikey( lonelyField.liveSearch )
					if (lonelyField.record && (ic > -1)) {
						lonelyField.originalSomeIDcode = lonelyField.record[ic]
					}
					else {
						lonelyField.originalSomeIDcode = null
					}
					//
					//
					console.log("* * * * * lonelyField.liveSearch * * * * " )
					//onsole.log( j, choicesViewName,columnToSearch, viewServingAsChoices )
					//onsole.log( j, lonelyField.liveSearch, view.columnTypingSearch )
					//
					sENGINE.precedente = null
					sENGINE.tapee = originalValue
					sENGINE.currentView = viewServingAsChoices
					sENGINE.columnToSearch = columnToSearch
					sENGINEon = true
				}
				//else {
				//	console.log("ERROR LiveSearch, unknown choicesViewName: ",choicesViewName )
				//}
			}
			else {
				//onsole.log("Helas, pas de LiveSearch for ",j, view.columnTypingSearch )
			}

			
			var xy = getPosition( elem )
			//
			//onsole.log( xy )
			var sty, esty,   sel, css, my,mx, ex,ey
			sty = fld.style
			css = lonelyField.inputcss
			esty = window.getComputedStyle( elem, null )
			mx = Math.round( css.getPropertyValue('padding-left').split("px")[0] )
			my = Math.round( css.getPropertyValue('padding-top').split("px")[0] )
			ex = Math.round( esty.getPropertyValue('padding-left').split("px")[0] )
			ey = Math.round( esty.getPropertyValue('padding-top').split("px")[0] )
			//test = window.getComputedStyle( fld, null )
			//sel = window.getSelection()
			//consolelog( "COMPUTED STYLE:",test )
			//consolelog( "SELECTION",sel )
			//
			//onsole.log( mx,my, "ex,ey=", ex,ey )
			sty.left = (xy.x - mx + ex) +"px"
			sty.top = (xy.y - my + ey)+"px"
			sty.width = (xy.w + (2*mx)) + "px"
			sty.height = (xy.h + (2*my)) + "px"
			sty.visibility = "visible"
			//sty.height = esty.height
			fld.focus()
			
			if ((!lonelyField.isMultiline) && (!lonelyField.htmlAccept) &&(!lonelyField.dontSelectOnOpen)) {
				fld.setSelectionRange(0,fld.value.length)
			}
			
			//onsole.log("> > >")
			
		}

		//var regxTAGS = /<\S[^><]*>/g
		var regxTAGS = /(<([^>]+)>)/ig
		
		function acceptFromMenu( someIDcode, htxt, agglomerer ) {
			if (lonelyField.liveSearch) {
				//onsole.log("EDITSYS.LIVESEARCH ======================>>> SHOULD paste this : ",someIDcode, htxt)
				lonelyField.inputtag.value = htxt
				lonelyField.someIDcode = someIDcode
				sENGINEisPaused( htxt )
			}
			else {
				//onsole.log("EDITSYS.FIXEDMENU ======================>>> SHOULD paste this : ",someIDcode, htxt)
				if (agglomerer==true) lonelyField.inputtag.value = lonelyField.inputtag.value +' '+ someIDcode
				else lonelyField.inputtag.value = someIDcode
			}
		}

		function floatingFieldClose( fromBlur ) {
			var elem
			elem = document.getElementById( lonelyField.unique_cell_id )
			
			var fld = lonelyField.inputtag
			var newValue = fld.value.trim()
			var newValuHTML
			
			var view, validation, ok,  cellclass
			view = lonelyField.view
			ok = lonelyField.acceptChanges

			//onsole.log( "------> trying floatingFieldClose()   view:", view, "lonelyField.acceptChanges = ", lonelyField.acceptChanges )
			//onsole.log("<<< FIELD CLOSE()")

			lonelyField.opened = false
			showPremadeMenuHelper( null )


			//new 5juill2016 -- on prends le ClassCSS demandé! (et on le garde pour le "perdre")
			if (cellclass = lonelyField.cellSpecialClass) {
				//oups: leftover?
				fld.classList.remove( cellclass )
			}
			lonelyField.cellSpecialClass = null
			//

			
			var isFromFilterLine
			isFromFilterLine = (lonelyField.isFromFilterLine)

			
			if (isFromFilterLine || (newValue != lonelyField.originalValue) || ((lonelyField.liveSearch) && (lonelyField.originalSomeIDcode != lonelyField.someIDcode))) {
				console.log( "EDIT CHANGES SOMETHING!! new:[", newValue,"] vs old:[", lonelyField.originalValue,"]" )

				if (isFromFilterLine) {
					ok = true
				}
				else if (ok && (typeof view.fieldValidation == "function")) {
					validation = view.fieldValidation( lonelyField.rec_id, lonelyField.cell_varname, newValue ) /// DICHOTOMIE!!!
					//onsole.log( "fieldValidation()", validation )
					newValue = validation[1]
					ok = (validation[0] == true)
				}
				

				if (ok) {
					//dans le html
					if ((newValue=='NULL') || (newValue=='null') || (newValue==null)) {
						newValuHTML = ''; 
					}
					else if (!lonelyField.htmlAccept) {
						newValue = newValue.replace( regxTAGS,"" ).trim()
						newValuHTML = newValue.replace( /\n/g, '<br>' )
					}
					else {
						newValuHTML = newValue.replace( /</g, "&lt;" ).replace( />/g, "&gt;" )
					}
					//dans le HTML
					
					elem.innerHTML = newValuHTML;
					
					
					
					if (isFromFilterLine) {
						if (typeof view.filterLine == "function") {
							view.filterFields[ lonelyField.cell_index ] = newValue
							//onsole.log( "view.filterFields:", view.filterFields, "no =", lonelyField.cell_index, newValue )
							view.filterLine( lonelyField.cell_varname, newValue, lonelyField.cell_inrecord )
						}
					}
					else {
						//
						//JUSTE À CET ENDROIT DANS LE HTML ...view.forceRefresh()
						//
						//au serveur
						//
						if (lonelyField.liveSearch) {
							//function __LA__(){}
							//onsole.log("SAVING ... ", lonelyField.liveSearch, "lonelyField.someIDcode=", lonelyField.someIDcode)
							// 2017 juin 21 : disconnect de DB direct
							view.updateOneColumn( 
								lonelyField.record, 
								[ lonelyField.liveSearch, lonelyField.cell_varname ], 
								[ lonelyField.someIDcode, newValue ] 
							);
						}
						else {
							// 2017 juin 21 : disconnect de DB direct
							view.updateOneColumn( lonelyField.record, lonelyField.cell_varname, newValue )
						}
						
						//en mémoire
						//PATCH
						if (view.columnSpecials && (view.columnSpecials[ lonelyField.cell_varname ])) {
							//(lonelyField.cell_varname == 'fr') || (lonelyField.cell_varname == 'en')
							//onsole.log("This field doesn't really exists in the record shown (probably a remote FR or EN)")
						}
						else {
							lonelyField.record[ lonelyField.cell_inrecord ] = newValue
						}
						//
						if (typeof view.afterValueChanged == "function") {
							//onsole.log( "lonelyFIELD : ", lonelyField )
							//var ri
							//ri = 
							view.afterValueChanged( lonelyField.rec_id, lonelyField.cell_varname, newValue )
							//o
							//onsole.log( "afterValueChanged()  rec_id, cell_varname, newValue:", ri, lonelyField.rec_id, lonelyField.cell_varname, newValue )

							if (!floatingFieldLineOrRecordID( lonelyField.rec_id )) {
								//onsole.warn( "WEIRD: did not find the rec_id ",rec_id, " in current someRecords of the view")
							}
							
							//if (ri > -1) {
							//	//the view altered something, better reset my values!
							//	lonelyField.record_index = ri
							//	//on peut faire plus s'il le faut... à voir...
							//}
						}
					}
				}
			}
			else {
				console.log("pas de changement dans la cellule!");
			}
			//DEBOG (mettre en commentaire la ligne suivante ici pour pouvoir inspecter le FLD)
			fld.style.visibility = "hidden"
			
			if (fromBlur !== true) fld.blur()
			//onsole.log("<<< ")
		}
		window.floatingFieldResize = floatingFieldResize
		window.floatingFieldFilter = floatingFieldFilter
		window.floatingFieldClose = floatingFieldClose
		
		editsys.floatingFieldOpen = floatingFieldOpen
		

		editsys.initLonelyField = function( whichDIV, alwaysSaveValue, enterLikeTab ) {
			var elem
			elem = document.getElementById( whichDIV )
			if (elem==null) return
			SHIMCL(elem)
			
			lonelyField.alwaysSaveValue = (alwaysSaveValue==true) || false
			//onsole.log( "editsys.initLonelyField() ... lonelyField.alwaysSaveValue = ",lonelyField.alwaysSaveValue )
			lonelyField.enterLikeTab = (enterLikeTab==true) || false
			//onsole.log( "editsys.initLonelyField() ... lonelyField.enterLikeTab = ",lonelyField.enterLikeTab )
			lonelyField.inputtag = elem
			lonelyField.inputcss = window.getComputedStyle( lonelyField.inputtag, null )

			window.pasteHelpText = function( ev, htxt, agglomerer ){
				ev.preventDefault()
				ev.stopImmediatePropagation()
				//onsole.log("EDIT.pasteHelpText ======================>>>  paste that : ",htxt,agglomerer, 'lonelyField.opened=', lonelyField.opened )
				if (agglomerer==true) lonelyField.inputtag.value = lonelyField.inputtag.value +' '+ htxt
				else lonelyField.inputtag.value = htxt
				return false;
			}

			window.pasteHelpComplex = function( ev, someIDcode, htxt, agglomerer ){
				ev.preventDefault()
				ev.stopImmediatePropagation()
				//onsole.log("EDIT.pasteHelpComplex ======================>>>  paste that : ",someIDcode, htxt, agglomerer, 'lonelyField.opened=', lonelyField.opened )
				acceptFromMenu( someIDcode, htxt, agglomerer )
				//
				if (!agglomerer) {
					ev.keyCode = 9; //trickery!! TAB == passe au champs suivant!
					floatingFieldFilter( ev )
				}
				//
				return false;
			}

		}
		
		
		// http://locutus.io/php/strings/strip_tags/
		editsys.strip_tags = function( input, allowed ) {
			allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('')
			var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
			var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi
			return input.replace(commentsAndPhpTags, '').replace(
				tags, 
				function ($0, $1 ) {
			    	return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
			  	}
			)
		}
		
		return editsys
	}
)