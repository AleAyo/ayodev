/**
 * @license
 * html.js - v0.1
 * Copyright (c) 2014, Alexandre Ayotte
 *
 * html.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/MIT
 */

define( 
	['libayo/ayo', 'libayo/lang'],
	function( AYO, LANG ) {
		var html = {}

		//pour simplifier... avant le code de LANG était ici
		var trad = LANG.trad
		html.trad = trad ///wierd!   ..pour les anciens codes qui utilisaient HTML.trad(...)
		
		
		function t( tag, params ) {
			//if (sty) { sty = " style=\""+sty+"\"" } else { sty = "" }
			//if (clss) { clss = " clss=\""+clss+"\"" } else { clss = "" }
			//
			if ((params==null) || (params==undefined)) params = ""
			return "<"+tag+" "+params+">"
		}
		function tend( tag ) {
			return "</"+tag+">"
		}
		function tag( tag, params, txt, noclose ) {
			//if (sty) { sty = " style=\""+sty+"\"" } else { sty = "" }
			//if (clss) { clss = " class=\""+clss+"\"" } else { clss = "" }
			//
			if ((params==null) || (params==undefined)) params = ""
			if (noclose===true) return "<"+tag+" "+params+">"
			return "<"+tag+" "+params+">"+txt+"</"+tag+">"
		}
		function p( txt, params ) { return tag( "p", params, txt ) }
		
		html.t = t
		html.tend = tend
		html.tag = tag
		html.p = p
		

		function functionName( func ) {
			if (typeof func == 'function') {
				//onsole.log( func )
				var s = func.toString()
				if ((typeof func == 'string') && (s.length>0)) return s
			}
			return ""
		}
		function tableEditable( someView, waitingForRefresh ) {
			return tableComplexe( someView, 'editable', null, waitingForRefresh )
		}
		function tableComplexe( someView, editMode, colonnesSpeciales, waitingForRefresh ) {
			var tot,i,alltot
			var output = ''
			var columnNames,someRecords,viewName, kit, columnLooks, lst, addAccept, deleteAccept
			var columnCuteNames
			var tut,j,itm, key, k, rec_id, cell_id, uneligne, funcname, dern_rec_prem_cell_editable, looks, column2record, cr
			var with_commentColumn, commentColumnFunc, cuteName, with_filterLine, separateOnValueChange, separateOnChangeInThisColumn, prevValueForSeparation, curValue, sovc_classe
			var largColonne, specialClasse, reloadAllFunctionName
			var onInsertFocusIndex, lookByCurrentRecord, dynalook
			var columnMultilines, displayAsGroupBy, displayAsGroupByFIRST
			
			//DEJAPERIME! , with_filterRecordFunc, ok_ligne    

			//onsole.log( "HTML.tableEditable()", someView )
			
			columnNames = someView.columnNames
			columnCuteNames = someView.columnCuteNames || someView.columnNames
			someRecords = someView.someRecords
			viewName = someView.viewName
			columnLooks = someView.columnLooks
			column2record = someView.column2record || null
			
			
			columnMultilines = someView.columnMultilines || []
			
			lookByCurrentRecord = someView.lookByCurrentRecord || []
			
			onInsertFocusIndex = someView.onInsertFocusIndex || 0;
			
			reloadAllFunctionName = (typeof someView.refreshFunction === 'string') ? 
						someView.refreshFunction : 
						(typeof someView.reloadAllFunctionName === 'string') ? someView.reloadAllFunctionName :
						null;
			
			separateOnValueChange = (someView.separateOnChangeInThisColumn !== undefined)
			separateOnChangeInThisColumn = (separateOnValueChange) ? someView.separateOnChangeInThisColumn : null
			prevValueForSeparation = 99999
			displaySeparationLabel = someView.displaySeparationLabel || false

			
			cuteName = someView.cuteName || viewName

			with_commentColumn = (typeof someView.commentColumn === 'function')
			with_filterLine = (typeof someView.filterLine === 'function') && (someView.butDontNeedAFilterLine !== true)
			
			addAccept = someView.addAccept || false
			deleteAccept = someView.deleteAccept || false
			
			//
			lst = []
			tot = columnLooks.length
			for (i=0;i<tot;i++) {
				if ((columnLooks[i] != "!") && (columnLooks[i] != "_")) lst.push( i )
			}
			someView.tabs = lst
			//
			if (reloadAllFunctionName != null) {
				cuteName += "&nbsp;&nbsp;" + tag("button", "id='refreshbtn-"+viewName+"' onclick='"+reloadAllFunctionName+"( this, event, \""+viewName+"\")' class='btn btn-default btninhead' ", 
					"<i class='fa fa-refresh fa-fw'></i>")
			}
			
			output += tag( "div", "class='topPatho' style='margin-top:4px'", cuteName )
			
			
			
			if (someView.force100pcent) output += t('table', 'class="ayotable force100pcent"')
			else output += t('table', 'class="ayotable"')

			output += t('thead')
			output += t('tr')

			tot = someRecords.length ///--------------------------------------------TOTAL DE LIGNES
			tut = columnNames.length
			var nbr_col_visibles = 0		
			
			for (j=0; j<tut; j++) {
				if (columnLooks[j] == '_') {
				}
				else if (columnLooks[j] == '#') {
					output += tag("th",'', tot)
					nbr_col_visibles += 1;
				}
				else {
					nbr_col_visibles += 1;
					output += tag("th",'', columnCuteNames[j])
				}
			}
			if (deleteAccept == true) {
				//output += tag("th",'', '')
			}
			
			output += tend('tr')
			output += tend('thead')
			
			output += t('tbody', 'style="height:85%; overflow-y:scroll; "')
			
			var recid_index,filterFields
			recid_index = columnNames.indexOf('id')
			
			if (with_filterLine) {
				if (typeof someView.filterFields != "object") {
					filterFields = []
					for (j=0; j<tut; j++) { filterFields.push('&nbsp;') }
					someView.filterFields = filterFields
				}
				else {
					filterFields = someView.filterFields
				}
				i = 0
				output += t('tr')
				for (j=0; j<tut; j++) {
					itm = filterFields[ j ]
					key = columnNames[j]
					looks = columnLooks[j]
					if (looks=='_') {//looks == '!' || 
					} 
					else {
						if (looks == 'float') {
							if (itm==null || itm=='null' || itm=='NULL') itm = ''
						}
						cell_id = "filter."+key+".!."+j+"."+viewName
						i += 1
						output += tag( "td", "cell_mode='editable' cell_view='"+viewName+"' id='"+cell_id+"' class='filterLine'", itm )
					}
				}
				output += tend('tr')
				//				
				output += t('tr')
				output += t( "td", " colspan='"+i+"' id='"+cell_id+"' class='filterLineResults'" )
				alltot = someView.allRecords.length
				if (tot == alltot) output += "Toutes les lignes ("+alltot+")"
				else output += "Lignes trouvées: "+tot+" sur "+alltot
				output += tend('td')					
				output += tend('tr')		
				//
			}
			
			if (waitingForRefresh) {
				console.log("waitingForRefresh ... spinnerHTML()");
				output += tend('tbody')
				output += tend("table")
				output += spinnerHTML()
			}
			else {
				var kinj = 1;
				var dernieri = tot-1
				//onsole.log("HTML.tableComplexe()   dernier i =", dernieri)

				for (i=0; i<tot; i++) {
					uneligne = someRecords[i]
					dern_rec_prem_cell_editable = null

						kinj += 1;
						// separateOnValueChange, separateOnChangeInThisColumn, prevValueForSeparation
						if (separateOnValueChange) {
							curValue = uneligne[ separateOnChangeInThisColumn ]
							if (prevValueForSeparation != curValue) {
								//output += t('tr', "style='border-bottom:4px !important'")
								prevValueForSeparation = curValue
								sovc_classe = ' sovc_classe'
								//
								kinj = 1;
								//nbr_col_visibles
								if (displaySeparationLabel) {
									output += t('tr')
									output += t( "td", " colspan='"+nbr_col_visibles+"'  class='filterLineResults'" )
									output += displaySeparationLabel+curValue
									output += tend('td')					
									output += tend('tr')		
								}
							}
							else sovc_classe = ''
							//output += t('tr')
						} 
						else sovc_classe = ''

						output += t('tr')

						//TUT DEMEURE LA QTY DE COLUMNNAMES...   tut = uneligne.length
						rec_id = uneligne[ recid_index ]
						//
						for (j=0; j<tut; j++) {
							if (column2record) cr = column2record[j]; else cr = j;
							itm = uneligne[ cr ]
							key = columnNames[j]
							looks = columnLooks[j]
							//
							largColonne = (someView.columnWidths) ? someView.columnWidths[j] : ''
							if (largColonne) {
								largColonne = " style='min-width:"+largColonne+"px'"
							}
							//if (looks == 'float') {
							//	largColonne = " style='max-width:"+largColonne+"px; overflow-y:hidden'"
							//}
							///
							specialClasse = (someView.columnClasses) ? someView.columnClasses[ j ] : ''
							//
							// new 30 mai 2017
							dynalook = lookByCurrentRecord[ j ];
							if (dynalook) {
								//onsole.log( "dynalook() j=",j )
								specialClasse = dynalook( uneligne )
							}
							//
							if (specialClasse) {
								if ((specialClasse == 'number') && (typeof itm == 'number')) {
									if (Math.abs(itm) > 0.00001) itm = itm.toFixed(4)
								}
								specialClasse = " class='"+specialClasse+sovc_classe+"'";
							}
							else if (sovc_classe) {
								specialClasse = " class='"+sovc_classe+"'";
							}
							//NOMORE....if (key == 'id') rec_id = itm
							//
							/////////NO MORE: TROp FUCKÉ DE MODIFIER UNE TABLE TIERCE EN SILENCE
							/////////if ((looks == 'fr')||(looks == 'en')) itm = trad( itm, '', looks );


							/////////
							if ((looks == 'ML') || (looks == '!ML') || (columnMultilines[ j ])) {
								if (itm==null || itm == undefined) itm = '';
								else itm = itm.toString().replace( /\n/g, '<br>' );
								//onsole.log( looks, itm );
							}
							//
							looks = looks.substr(0,1)
							if (looks == "#") {
								output += tag( "td", "class='gris'", (i+1) )
							}
							else if (looks == '$') {
								output += tag( "td", "class='gris'", (kinj) )
							}
							else if (looks == '_') {
							} 
							else if ((looks == '!') || (looks=='_') || (AYO.NOCHDB)) {
								output += tag( "td", "class='gris"+sovc_classe+"'", itm )
							}
							else {
								//onsole.log( columnLooks[j], itm )
								//if (looks == 'float') {
								if (itm==null || itm=='null' || itm=='NULL') itm = ''
								//}
								cell_id = rec_id+"."+key+".!."+j+"."+viewName
								// new: +viewName si le même record id est à plusieurs endroits
								output += tag( "td", "cell_mode='"+editMode+"' cell_view='"+viewName+"' id='"+cell_id+"'"+largColonne+specialClasse, itm )
								//
								if ((dernieri == i) && (dern_rec_prem_cell_editable==null) && (j >= onInsertFocusIndex)) {//
									//debugger;
									//onsole.log( "HTML.tableComplexe() dern_rec_prem_cell_editable: ", dernieri, tot, cell_id )
									dern_rec_prem_cell_editable = cell_id
								}
							}
						}
						/**/
						if ((deleteAccept == true) && (!AYO.NOCHDB)) {
							cell_id = viewName+"."+rec_id+"."+i
							output += tag( "td", "style='border:none'", //class='noborders'  type='submit'
								tag("button", "id='delbtn-"+cell_id+"' onclick='deleteTableRecord( this, event, \""+cell_id+"\")' class='btn btn-xs btn-default' ", 
								"<i class='fa fa-trash fa-fw'></i>")
							 )
						}
						if (with_commentColumn) {
							//cell_id = viewName+"."+rec_id+".txt"
							cell_id = rec_id+".txt"
							output += tag( "td", "id='"+cell_id+"' style='border:none; color:#999'", someView.commentColumn( rec_id, uneligne ) )
						}
						//else {
							//		output += tag( "td", '', '??' )
						//}
						//*/
						output += tend('tr')					
				}
				output += tend('tbody')
				output += tend("table")

				if (tot==0) {
					output += tag("p", '', "(aucun)");
				}

				/**/
				if ((addAccept == true) && (!AYO.NOCHDB)) {
					cell_id = viewName
					output += tag( "div", "style='margin-bottom:16px;'", 
						tag("button", "id='addbtn-"+cell_id+"' onclick='addTableRecord( this, event, \""+cell_id+"\")' class='btn btn-sm btn-default' ", 
						"<i class='fa fa-plus fa-fw'></i>")
					 )
				}
				else {
					output += "<div style='height:18px'></div>"
				}
				someView.dern_rec_prem_cell_editable = dern_rec_prem_cell_editable
				//*/
			}
			
			return output
		}
		html.tableEditable = tableEditable
		
		html.insideConfirmDeleteDialog = function( divID, confirmFunc, blurFunc ) { //onblur="floatingConfirmDeleteClose()"
			return "<div class='confort' style='display:inline'>"+
			trad("confirmDelete", "On efface?")+
			"</div>"+
			"<button id='CD_"+divID+"' type='submit' class='btn btn-default' onclick='"+confirmFunc+"(this,event);' onblur='"+blurFunc+"(this,event);'>"+
			trad('oui','Oui!')+"</button>"
		}
		html.userConnectedLine = function( usernameID, logoutFunc, inverse, iconbtnlogout, iconbtnlogin, showLoginPageFunc ) {
			var inv, txtcol, btnsLOG
			if (inverse==true) {
				inv = " fa-inverse"
				txtcol = " blanc"
			}
			else {
				inv = ""
				txtcol = " noir"
			}
			iconbtnlogout = iconbtnlogout || "<i class='fa fa-power-off fa-fw'></i>"
			iconbtnlogin = iconbtnlogin || "<i class='fa fa-user fa-fw'></i>"
			
			btnsLOG = "<button id='LO_"+usernameID+"' type='submit' class='btn btn-default displaynone' onclick='"+logoutFunc+"(this,event);'>"+iconbtnlogout+"</button>"
			if (showLoginPageFunc) {
				btnsLOG += "<button id='LI_"+usernameID+"' type='submit' class='btn btn-default displaynone' onclick='"+showLoginPageFunc+"(this,event);'>"+iconbtnlogin+"</button>"
			} 
			else { //juste pour que document.getByID ....MARCHE!
				btnsLOG += "<span id='LI_"+usernameID+"' class='displaynone'></span>"
			}
			//  
			
			return "<div class='confort' style='display:inline-block'>"+
			//"<span class='fa fa-smile-o gros padtopSign "+inv+"'>"+
			"<span id='"+usernameID+"' class=' "+txtcol+" '></span>"+
			//</span>
			"</div>"+btnsLOG
		}
		
		html.tablikeButton = function( idbtn, numerobtn, onclickfunc, attr, texte ) {
			return "<a role='button' id='"+idbtn+"' onclick='"+onclickfunc+"(this, event, "+numerobtn+")' "+attr+">"+texte+"</a>";
		}
		
		html.tryChangeBtnClass = function( prefix, someid, removeclass, addclass ) {
			if (someid==null) return
			var btn,bid
			bid = prefix+someid
			btn = document.getElementById( bid )
			
			if (btn!=null){
				SHIMCL(btn)
				if (removeclass!=null) btn.classList.remove( removeclass )
				if (addclass!=null) btn.classList.add( addclass )
			} 
		}
		

		return html
	}
)