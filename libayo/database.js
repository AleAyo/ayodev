/**
 * @license
 * database.js - v0.1
 * Copyright (c) 2014, Alexandre Ayotte
 *
 * data.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/MIT
 */

define( 
	['libayo/ayo', 'libayo/misc', 'libayo/lang', 'libayo/html'],
	function( AYO, MISC, LANG, HTML ) {
		var db = {}

		function consolelog() {}


		var asynchroneousSQLstack = []
		
		function registerCRUDchanges( crudACT, view, record, colNAME, colVALUE ) {
			var alteration
			var oneThingToDo = {
				receiver : view,
				act: 'sCRUD', //pour pouvoir le modifier dans ALTERATION!! yepee
				crud: crudACT,
				views_file: view.viewsFile,  
				view_name: view.viewName, 
				record_id: record[0]
			}
			if ((colNAME != null) && (colNAME != undefined)) {
				oneThingToDo.column_name = colNAME
				oneThingToDo.column_value = colVALUE
			}
			if (oneThingToDo != null) {
				asynchroneousSQLstack.push( oneThingToDo )
			}
		}


		function registerChanges( sqlACTION, view, record, colNAME, colVALUE ) {
			var alteration
			var oneThingToDo = {
				receiver : view,
				act: 'dbtiny', //pour pouvoir le modifier dans ALTERATION!! yepee
				sql: sqlACTION,
				table_name: view.sqlTable,
				record_id: record[0]
			}
			if ((colNAME != null) && (colNAME != undefined)) {
				//if ((view.columnSpecials) && (typeof (alteration = view.columnSpecials[ colNAME ]) == 'function')) {
				//	oneThingToDo = alteration( view, record, oneThingToDo, colNAME, colVALUE )
				//}
				//else {
				//	oneThingToDo.column_name = colNAME
				//	oneThingToDo.column_value = colVALUE
				//}
				oneThingToDo.column_name = colNAME
				oneThingToDo.column_value = colVALUE
				//
				if (view.columnSpecials) {
					alteration = view.columnSpecials[ colNAME ]
					if (typeof (alteration) == 'function') {
						oneThingToDo = alteration( view, record, oneThingToDo, colNAME, colVALUE )
					}
					//else console.warn( "A::: DB.registerChanges/ view.columnSpecials=", view.columnSpecials, " colNAME=",colNAME )
				}
				//else console.warn( "B::: DB.registerChanges/ view.columnSpecials=", view.columnSpecials, " colNAME=",colNAME )
			}
			//
			//onsole.log( "DB.registerChanges( sqlACTION, view, record, colNAME ) ", view, record , colNAME ) //, colVALUE )
			//onsole.log( "oneThingToDo: ", oneThingToDo )
			if (oneThingToDo != null) {
				asynchroneousSQLstack.push( oneThingToDo )
				//onsole.log( sqlACTION, asynchroneousSQLstack )
			}
		}
		//on concerve au cas ou legacy code utilise
		db.registerChanges = registerChanges


		db.hasAccumulatedSomething = function () {
			return (AYO.yaBeaucoupDePicos()) || (asynchroneousSQLstack.length > 0)
		}
		
		db.dumpSQLstack = function() {
			var tot,i, todo
			tot = asynchroneousSQLstack.length
			console.log( "dumpSQLstack tot=", tot )
			for( i=0; i<tot; i++ ) {
				todo = asynchroneousSQLstack[i]
				console.log( i, todo )
			}
		}
		db.sendAllSQLstack = function( ) { //clientAvertirFunc PERIMEE
			var stack
			stack = asynchroneousSQLstack
			tot = stack.length
			if (tot == 0) {
				if (! AYO.yaBeaucoupDePicos()) return //--------------------------> nothing to do at all
			}
			asynchroneousSQLstack = []
			
			//SERRURE ANTI CHANGEMENT DANS LA DB ONLINE!
			//if (1) return
			
			var allreq, receiver
			allreq = AYO.newXHR()
			//onsole.log("sendAllSQLstack tot=", tot)
			for(i=0;i<tot;i++) {
				todo = stack[i]
				receiver = todo.receiver
				todo.receiver = '*' ///// <--------------------------pour ne pas envoyer un objet!!
				allreq.add( receiver, { act:todo.act, data:todo } )
			}
			//
			allreq.send() //quietly
		}
		
		var viderSQLstackAndPicosDONE = false;
		function viderSQLstackAndPicos( ev ){
			if (viderSQLstackAndPicosDONE) return null;
			//
			AYO.byebye()
			AYO.picopisteCeci( "BYEBYE" )
			db.sendAllSQLstack()
			viderSQLstackAndPicosDONE = true
			var i,b
			for( i = 0; i < 5000; i++ ) { b= Math.log(i) }
			return null
		}
		
		window.addEventListener( "beforeunload", viderSQLstackAndPicos );
		window.addEventListener( "unload", viderSQLstackAndPicos );
		
		
		function everybodyElseReceive( dataReceived, notThisOne ) {
			//
			var otherView, whatWasDone, i,tot
			whatWasDone = dataReceived.dataReturned.what_was_done
			tot = onlyThoseInterrested.length
			for(i=0; i<tot; i++) {
				otherView = onlyThoseInterrested[ i ]
				if (otherView == notThisOne) continue; //il faut qu'il utilise receive() pour lui-meme, DAH!
				//
				if (otherView.dictInternalVersion) {
					if (LANG.dictInternalVersion > otherView.dictInternalVersion) {
						//onsole.log("automatic refresh BECAUSE LANG.dictionnaire was changed, forcing:", otherView.viewName )
						//sera fait dans refresh? : otherView.dictInternalVersion = LANG.dictInternalVersion
						otherView.lastViewed = otherView.lastLoaded - 2
					}
				}
				//
				if (otherView.someoneElseReceive) otherView.someoneElseReceive( whatWasDone, dataReceived )
			}
		}
		db.factoryReceive = function( dataReceived ){
			this.loadInProgress = false
			//
			if (dataReceived.ok == 'ok') {
				//
				//
				//onsole.log( "code commun db view. receive(r)... ", dataReceived )
				//onsole.log( "                                   ", dataReceived.dataReturned.what_was_done )
				//
				if (dataReceived.dataReturned.records) {
					this.lastLoaded += 1
					this.allRecords = dataReceived.dataReturned.records
					this.someRecords = this.allRecords //meme adresse (object instance)
					//
					this.errordb = null
				}
				else {
					this.errordb = null
					//onsole.log( "   records = NULL ???  dataReceived.dataReturned :", dataReceived.dataReturned )
				}
				//
				//onsole.log( this.viewName, "...code commun db view.receive(r)... QTY RECORDS:", this.allRecords.length )
				everybodyElseReceive( dataReceived, this )
			}
			else {
				//comment avertir qu'on a reçu une erreur??
				// < WARNING >
				//
				this.errordb = dataReceived.error
				console.log( this.viewName, "...code commun db view.receive(r)... ERROR ", dataReceived.error )
				//
			}
			if ((this.errordb != null) && (typeof this.errorReceive == "function")) {
				this.errorReceive( dataReceived )
			}
		}
		db.factoryDisplayMenyRecords = function( waitingForRefresh ) {
			if (this.divOBJ == null) {
				if (this.divID == null) return
				this.divOBJ = document.getElementById( this.divID )
				if (this.divOBJ == null) return
				//onsole.log("YES!! : we found the DIV to put html table data INTO!!")
			}
			this.divOBJ.innerHTML = this.records2html( waitingForRefresh )
			this.isRefreshed()
		}

		
		db.installManyAnimLoader = function( qty, myAnimClass ){
			return ""
		}

		

		var allDBviews = {}
		var onlyThoseInterrested = []
		
		db.publishCustomView = function( viewName, view ) {
			if (allDBviews.hasOwnProperty( viewName )) {
				console.log("ERROR: this view is already defined!?? ", viewName)
				return null
			}
			allDBviews[ viewName ] = view
		}

		db.factoryReceive_v2 = function( dataReceived ){
			this.loadInProgress = false
			//
			if (dataReceived.ok == 'ok') {
				var recus = dataReceived.dataReturned
				if (recus.viewSpec) {
					//onsole.log( "factoryReceive_v2() recus.viewSpec =", recus.viewSpec )
					var viewSpec = recus.viewSpec
					for(prop in viewSpec) {
						if (prop == 'bidon') continue;
						//if (!this.hasOwnProperty( prop )) { BEN NON: FORCE LOAD STUFF!!!
							this[prop] = viewSpec[prop]
						//}
					}
				}
				this.errordb = null
				if (recus.records) {
					//onsole.log( "factoryReceive_v2() recus.records =", recus.records )
					this.lastLoaded += 1
					this.allRecords = recus.records
					this.someRecords = this.allRecords //meme adresse (object instance)
				}
				everybodyElseReceive( dataReceived, this )
			}
			else {
				this.errordb = dataReceived.error
				console.log( this.viewName, "...code commun db view.receive(r)... ERROR ! ", dataReceived )
			}
			if ((this.errordb != null) && (typeof this.errorReceive == "function")) {
				this.errorReceive( dataReceived )
			}
		}
		db.factoryDeleteOneRecord_v2 = function( rec_id, some_no ) {
			if (!this.deleteAccept) return false
			var trashed,zzzz, rec_no
			rec_no = this.allRecords.findIndex( function( rec ) { return (rec[0] == rec_id) } )
			var rec = this.allRecords[ rec_no ]
			trashed = this.allRecords.splice( rec_no, 1 )
			if (this.allRecords != this.someRecords) {
				rec_no = this.someRecords.findIndex( function( rec ) { return (rec[0] == rec_id) } )
				zzzz = this.someRecords.splice( rec_no, 1 )
			}
			if ((trashed.length > 0)) {
				if (this.saveAutomatic) registerCRUDchanges( "d", this, rec )
				return true
			}
			return false
		}
		db.factoryAddEmptyRecord_v2 = function() {
			if (!this.addAccept) return false
			//
			var columnNames = this.columnNames
			var rec = []
			while( rec.length < columnNames.length) {
				rec.push("")
			}
			uniq = uniqueIDgeneratorfunction( this.idprefix, false )
			rec[0] = uniq
			//
			//pour populer le record de valeurs communes, ou par défaut, etc
			if (typeof this.fillDefaultInNewRecord == "function") {
				this.fillDefaultInNewRecord( rec )
			}
			//
			this.allRecords.push( rec )
			if (this.allRecords != this.someRecords) this.someRecords.push( rec )
			//
			//option: envoyer requete mais continuer en assumant que tout est OK
			//99% ce sera vrai, selon l'erreur retournée, on pourrait ajuster ici (changer le ID, etc selon le cas)
			if (this.saveAutomatic) {
				registerCRUDchanges( "c", this, rec, columnNames, rec )
			}
			return true
		}
		db.factoryUpdateOneColumn_v2 = function( rec, colname, colval ){
			if (this.saveAutomatic) {
				//onsole.log( "factoryUpdateOneColumn_v2", colname )
				registerCRUDchanges( "u", this, rec, colname, colval )
			}	
		}

		window.reloadAllDataForThisView = function( btn, ev, viewName ) {
			btn.blur()
			var view = db.whichView( viewName )
			if (typeof (view.loadAll) === "function") view.loadAll()
		}
		
		//v2 -- 2017 juin 21 -- on recoit certaines données à chaque LoadAll
		db.newView_v2 = function( params ) {
			if (!(params.viewsFile)) {
				console.log( "erreur!!!   db view with no 'viewsFiles' ??? ", params )
				return null
			}
			if (!(params.viewName)) {
				console.log( "erreur!!!   db view with no 'viewName' ??? ", params )
				return null
			}
			if (allDBviews.hasOwnProperty(params.viewName)) {
				console.log("ERROR: this view is already defined!?? ", params.viewName)
				return null
			}
			var v = {
				viewsFile : params.viewsFile,
				viewName : params.viewName,
				saveAutomatic : params.saveAutomatic || false,
				allRecords    : params.allRecords || [],   ///façon de preMADE ?

				idprefix : params.prefixForID || params.idprefix || 'Xx',
				
				lastLoaded : 0,
				lastViewed : 0,
				loadInProgress : false,
			
				loadAll : function() {
					this.loadInProgress = true
					var allreq
					allreq = AYO.newXHR()
					allreq.add(  this,  { 
						act : 'sCRUD', 
						data : { 
							crud : 'r',
							views_file: this.viewsFile,  
							view_name: this.viewName, 
							//
							where_clause: this.sqlWhere,
							order_clause: this.sqlOrderBy
						} 
					} )
					allreq.send() 
				},
				reloadAllFunctionName : (params.withAutoReloadFunction) ? "reloadAllDataForThisView" : null,
				
				listen : params.listen || null,
				receive : params.receive || db.factoryReceive_v2,
				factoryReceive : db.factoryReceive_v2, //new:2017mai25: pour faire facilement: this.factoryReceive
				someoneElseReceive : null,
				divID : null,
				divOBJ : null,
				records2html : function( waitingForRefresh ) { 
					return HTML.tableEditable( this, waitingForRefresh )
				},
				updateOneColumn : params.updateOneColumn || db.factoryUpdateOneColumn_v2,
				factoryUpdateOneColumn : db.factoryUpdateOneColumn_v2,
				//
				deleteOneRecord : params.deleteOneRecord || db.factoryDeleteOneRecord_v2,
				factoryDeleteOneRecord : db.factoryDeleteOneRecord_v2,
				//
				addEmptyRecord : params.addEmptyRecord || db.factoryAddEmptyRecord_v2,
				factoryAddEmptyRecord : db.factoryAddEmptyRecord_v2,
				//
				ikey : function( colname ) {
					return this.columnNames.indexOf( colname )
				},
				cellIsChangedFromOutside : function ( record, colname, colval ) {
					var k
					k = this.columnNames.indexOf( colname )
					if (k<0) {
						console.warn( "ERROR:cellIsChangedFromOutside() colname UNKNOWNED:", colname, record )
						return ///RETURN BECAUSE  ** ERROR
					}
					//onsole.log("cellIsChangedFromOutside() -- yé -- ", colname, record, colval )
					// in remote db
					this.updateOneColumn( record, colname, colval )
					// in memory
					record[ k ] = colval
					//
					if (typeof this.afterValueChanged == "function") {
						var ri
						ri = this.afterValueChanged( record[0], colname, colval )
					}
				},
				shouldBeRefreshed : function() {
					return this.lastViewed < this.lastLoaded
				},
				isRefreshed : function() {
					if (this.dictInternalVersion) this.dictInternalVersion = LANG.dictInternalVersion
					this.lastViewed = this.lastLoaded
				},
				willNeedRefresh : function() {
					this.lastViewed = this.lastLoaded - 2
				},
				forceRefresh : function() {
					this.lastViewed = this.lastLoaded - 2
					//
					//onsole.log(" forceRefresh()", this )
					if (typeof this.refresh == "function") this.refresh()
					else console.log( " duh??v2 this.refresh UNDEFINED?")
				},

				displayOneRecord : params.displayOneRecord || null,
				displayManyRecords :  params.displayManyRecords || db.factoryDisplayMenyRecords,

				fieldValidation: params.fieldValidation || null ///?? pourquoi en fournir une:  function( record_id, key, val ) { return [true, val] }
			}
			v.someRecords = v.allRecords

			for(prop in params) {
				if (prop == 'bidon') continue;
				if (!v.hasOwnProperty( prop)) {
					//onsole.log("oups! on a oublié cette variable custom:" , prop )
					v[prop] = params[prop]
				}
			}

			if (v.someoneElseReceive || v.dictInternalVersion) onlyThoseInterrested.push( v )
			allDBviews[ v.viewName ] = v

			return v
		}


		db.newView = function( params ) {
			if (!(params.viewName)) {
				console.log( "erreur!!!   db view is not NAMED??? ", params )
				return null
			}
			if (allDBviews.hasOwnProperty(params.viewName)) {
				console.log("ERROR: this view is already defined!?? ", params.viewName)
				return null
			}
			if ((params.columnNames) && (params.sqlKeys == null || params.sqlKeys == undefined)) {
				params.sqlKeys = params.columnNames.join(',')
			}
			
			var v = {
				viewName : params.viewName,
				
				//section plus DB
				sqlTable   : params.sqlTable || 'table_unknowned',
				prefixForID : params.prefixForID || '??',
				sqlKeys    : params.sqlKeys,
				sqlWhere   : params.sqlWhere || 'true',
				sqlOrderBy : params.sqlOrderBy || '',
				lastLoaded : 0,
				lastViewed : 0,
				loadInProgress : false,
				allRecords    : params.allRecords || [],
				
				loadAll : function() {
					this.loadInProgress = true
					var allreq
					allreq = AYO.newXHR()
					allreq.add(  this,  { 
						act : 'getlistof', 
						data : { 
							table_name: this.sqlTable,  
							column_name: this.sqlKeys, 
							//new 30 mai
							extraSelect: this.extraSelect, 
							extraCols: this.extraCols, 
							//
							where_clause: this.sqlWhere,
							order_by: this.sqlOrderBy
						} 
					} )
					//onsole.log("=================ALLREQ", allreq )
					allreq.send() 
				},
				listen : params.listen || null,
				receive : params.receive || db.factoryReceive,
				factoryReceive : db.factoryReceive, //new:2017mai25: pour faire facilement: this.factoryReceive
				
				someoneElseReceive : params.someoneElseReceive || null,

				//section plus VIEW
				divID : null,
				divOBJ : null,
				attachTo : function( someTHING ) {
					//WAS someID, someOBJ ) 
					if (typeof someTHING == 'string') {
						this.divID = someTHING
						this.divOBJ = document.getElementById( someTHING )
					}
					else if (typeof someTHING == 'object') {
						this.divOBJ = someTHING;
						this.divID = someTHING.id || null
					}
				},
				records2html : function( waitingForRefresh ) { // WAS: table2html
					//(?) on ne peut pas en ajouter si elle est vide
					//( ) y a pas le bouton [+] 
					//....if (this.allRecords.length < 1) return HTML.tag('p', null,'(vide)');
					//
					return HTML.tableEditable( this, waitingForRefresh )
				},
				ikey : function( colname ) {
					return this.columnNames.indexOf( colname )
				},
				
				columnNames : params.columnNames || [],
				column2record : params.column2record || null, //danger!
				columnLooks : params.columnLooks || [],
				columnSpecials : params.columnSpecials || {},
				
				deleteAccept : (params.deleteAccept && (!AYO.NOCHDB)) || false,
				addAccept : (params.addAccept && (!AYO.NOCHDB)) || false,
				saveAutomatic : (params.saveAutomatic && (!AYO.NOCHDB)) || false,
				
				//OLD WAY, remplacée par fillDefaultInNewRecord
				related_id_column : params.related_id_column || null,
				related_id_value : params.related_id_value || null,
				//new way
				fillDefaultInNewRecord : params.fillDefaultInNewRecord || null,
				insertNewRecord : params.insertNewRecord || null,
				
				updateOneColumn : function( record, cell_varname, newValue ) {
					if (this.saveAutomatic) {
						registerChanges( "modifs", this, record, cell_varname, newValue )
					}	
				},
				deleteOneRecord : function( rec_id, some_no ) {
					if (!this.deleteAccept) return false
					var trashed,zzzz, rec_no
					
					rec_no = this.allRecords.findIndex( function( rec ) { return (rec[0] == rec_id) } )
					var rec = this.allRecords[ rec_no ]
					
					trashed = this.allRecords.splice( rec_no, 1 )
					
					if (this.allRecords != this.someRecords) {
						rec_no = this.someRecords.findIndex( function( rec ) { return (rec[0] == rec_id) } )
						zzzz = this.someRecords.splice( rec_no, 1 )
					}
					//onsole.log( "DB.deleteOneRecord() trashed is:", trashed )
					//
					//
					if ((trashed.length > 0)) {
						if (this.saveAutomatic) registerChanges( "deletes", this, rec )
						//
						if (typeof this.afterDeleteRecord == "function") this.afterDeleteRecord()
						//
						return true
					}
					return false
				},
				addEmptyRecord : function( ) {
					if (!this.addAccept) return false
					//
					var columnNames = this.columnNames
					var rec = []
					while( rec.length < columnNames.length) {
						rec.push("")
					}
					uniq = uniqueIDgeneratorfunction( this.prefixForID, false )
					rec[0] = uniq;
					//
					///////////// new remplir des mêmes valeurs que le filtrage, au moins pour pas la perdre si le filtre se refait après le new record "vide"
					var i,tot,f, filters = this.filterFields;
					if (filters) {
						console.log("new AVANT:",rec);
						tot = Math.min( filters.length, rec.length );
						for( i=1; i<tot; i++ ) {
							f = filters[i];
							if ((f != undefined) && (f != null) && (f != "") && (f != "&nbsp;")) {
								rec[i] = f;
							}
						}
						console.log("new APRES:",rec);
					}
					//
					//ALTERNATIVE plus élégante pour populer le record de valeurs communes, ou par défaut, etc
					if (typeof this.fillDefaultInNewRecord == "function") this.fillDefaultInNewRecord( rec )
					//
					var relcolnm = null
					//LEGACY -- NE PLUS UTILSER
					if (this.related_id_column) { 
						// 0 + null + undefined ... est faux ici : donc related_id ne peut pas être le premier indice (0), ce qui est plausible
						rec[ this.related_id_column ] = this.related_id_value
						relcolnm = columnNames[this.related_id_column]
					}
					//else {
					//	console.log(" related_id_column NOT DEFINED?? ", this )
					//}
					
					//
					//pas très utile pour le moment
					//vu que c'est NEW, à part la valeur par defaut, y a pas raison d'insérer le rec ailleurs dans allRecords...
					//...erreur:
					//2017 --> certains NEW ont besoin de remplir plusieurs colonnes avec des valeurs par défaut (ex jourhre!)
					//         alors cette fonction va devoir TOUT faire, y compris le registerChanges
					//      ...comme cette fonction n'était nul part utilisée, on déplace le registerChanges dans le ELSE ci-dessous
					if (typeof this.insertNewRecord == "function") {
						this.insertNewRecord( rec )
					}
					else {
						this.allRecords.push( rec )
						if (this.allRecords != this.someRecords) this.someRecords.push( rec )
						//
						//option: envoyer requete mais continuer en assumant que tout est OK
						//99% ce sera vrai, selon l'erreur retournée, on pourrait ajuster ici (changer le ID, etc selon le cas)
						if (this.saveAutomatic) {
							registerChanges( "creates", this, rec, relcolnm, this.related_id_value )
						}
						//
					}
					//
					if (typeof this.afterAddRecord == "function") this.afterAddRecord()
					//
					return true
				},
				
				shouldBeRefreshed : function() {
					return this.lastViewed < this.lastLoaded
				},
				isRefreshed : function() {
					if (this.dictInternalVersion) this.dictInternalVersion = LANG.dictInternalVersion
					this.lastViewed = this.lastLoaded
				},
				willNeedRefresh : function() {
					this.lastViewed = this.lastLoaded - 2
				},
				forceRefresh : function() {
					this.lastViewed = this.lastLoaded - 2
					//
					//onsole.log(" forceRefresh()", this )
					if (typeof this.refresh == "function") this.refresh()
					else console.log( " duh?? this.refresh UNDEFINED?")
				},
				
				displayOneRecord : params.displayOneRecord || null,
				displayManyRecords :  params.displayManyRecords || db.factoryDisplayMenyRecords,

				fieldValidation: params.fieldValidation || null ///?? pourquoi en fournir une:  function( record_id, key, val ) { return [true, val] }
			}
			v.someRecords = v.allRecords
			
			for(prop in params) {
				if (prop == 'bidon') continue;
				if (!v.hasOwnProperty( prop)) {
					//onsole.log("oups! on a oublié cette variable custom:" , prop )
					v[prop] = params[prop]
				}
			}
			
			if (v.someoneElseReceive || v.dictInternalVersion) onlyThoseInterrested.push( v )
			allDBviews[ v.viewName ] = v
			
			return v
		}
		db.whichView = function( nom ) {
			return allDBviews[ nom ]
		}
		//EDIT en a besoin
		db.dump = function() {
			console.log( allDBviews )
			console.log( onlyThoseInterrested )
		}
		
		
		db.filterNow = function( someView ) {
			var filters = someView.filterFields
			var some //= []
			var all = someView.allRecords
			
			var columnLooks = someView.columnLooks
			var column2record = someView.column2record || null

			var tot,tut,i,j,lst, ok, fj,  itm,looks, cr,   k,ttt,words,none
			
			var trad = HTML.trad
			
			tut = filters.length
			//onsole.log( "FILTERNOW()----------------->", tut, columnLooks.length)
			
			i = -1;

			some = all.filter( 
				function( uneligne ) { 
					i += 1
					//
					//onsole.log( "  FILTERNOW():",i, uneligne, filters )
					
					for (j=0; j<tut; j++) {
						fj = filters[j];
						//
						if (fj == '' || fj == '	 ' || fj == '&nbsp;') continue
						fj = fj.toLowerCase()
						//
						if (column2record) cr = column2record[j]; else cr = j;
						itm = uneligne[ cr ]
						looks = columnLooks[j]
						
						if ((looks == '_')) continue; // || (looks == '!')

						if ((looks == 'fr') || (looks == 'en')) itm = trad( itm, '', looks );
						
						if ((itm == '') || (itm==null) || (itm==undefined)) return false
						
						//si j'en trouve un seul des mots dedans FJ, c'est ok, on continue (i.e chercher le prochain champ (itm))
						itm = itm.toString().toLowerCase()
						fj = fj.replace(/,/g,' ');
						words = fj.split(" ");
						ttt = words.length
						none = 0
						for(k=0; k<ttt; k++) {
							fj = words[k]
							if (fj=='') continue;
							ok = itm.indexOf(words[k])
							if (i==1) console.log( j, k, "---->>", "["+itm+"]", "["+fj+"]", ok )
							if (ok > -1) {
								none += 1
							}
						}
						//ok = itm.toString().toLowerCase().indexOf(fj)
						//onsole.log( i,j, "---->>", "["+itm+"]", "["+fj+"]", ok )
						
						//A : si on n'a pas trouvé CHACUN DES MOTS DE FJ, la ligne ne doit pas être sélectionnée
						//if (none<ttt) return false
						//B : si aucun a été trouvé, la ligne ne doit pas être sélectionnée
						if (none == 0) return false
						
						
						//if (ok == -1) return false
					}
					return true 
				} 
			)
			
			someView.someRecords = some
			someView.displayManyRecords()
			//.forceRefresh()
		}
		

		function AA_convert32( number ) {
			var chars,c,suivant
			chars = '';
			for(;;) {
				suivant = Math.floor(number / 32);
				c = number - (suivant * 32);
				number = suivant;
				chars = AALPHA.charAt( c ) + chars;
				if (number<=0) break;
			}
			return chars;
		}
		function AA_base32plusFill( number, wide ) {
			var wide = wide+0;
			var n32 = AA_convert32( number ) //(number.toString(32)).toUpperCase();
			var lon = n32.length;
			//
			//if (lon > wide) console.log("error base32! "+number+" >> "+n32+" vs WIDE:"+wide);
			if (lon == wide) return n32;

			for(;;){
				if (lon >= wide) return n32
				n32 += AAZERO + n32
				lon += 1
			}
			return n32 //par beauté... ne sera jamais appelé
		} 
		var counteruniq = 1
		function uniqueIDgeneratorfunction( twoletter, withHasard ) {
			var d = new Date();

			var hms = (d.getHours() *60*60) + (d.getMinutes() * 60) + d.getSeconds(); //--en base 32, le max 86400 prends 4 chars!!!
			var yr = d.getFullYear() - 2014;
			var mt = d.getMonth(); // 1..12
			var dy = d.getDate();  // 1..31 rentre dans 32

			var msec = d.getMilliseconds();

			//twoletter = (twoletter+"??").substring(0,2);///premierement: si zero fournit, donner une lettre
			//var ts = (twoletter+'??').substring(0,2);//s'assurer qu'on a deuxlettre, et pas plus, ni moins!!
			//NO MORE!
			ts = twoletter;

			ts += AA_base32plusFill( yr, 2 ); //2014 + 32*32 = 2014+1024 = 3038!!!
			ts += AA_base32plusFill( mt, 1 );
			ts += AA_base32plusFill( dy, 1 );
			
			//PCQ 2 char pour annee, on enlève le -
			//ts += '-';
			ts += AA_base32plusFill( hms, 4 );
			ts += AA_base32plusFill( msec, 3 ); //---3 : 2017mars
			//ça retourne 12 charactères!!
			//+2
			
			if (withHasard == true) {
				var haz = Math.floor(Math.random() * 32767) ///1024) //32768)
				ts += AA_base32plusFill( haz, 2 ); //---3 : 2017mars
			}
			else {
				ts += AA_base32plusFill( counteruniq, 2 ); //---3 : 2017mars
				counteruniq += 1;
			}
			//ça retourne 14 charactères!!
			//v2017mars13 --> 16 incluant le twoLetter

			return ts
		}
		db.uniqueIDgeneratorfunction = uniqueIDgeneratorfunction
		AYO.uniqueIDgeneratorfunction = uniqueIDgeneratorfunction //PATCH pour vieux code

		/*
		db.initSilentDictionnaire = function() {
			//
			db.silentDictionnaire = db.newView( {
					viewName: 'dictionnaireSilencieux',
					sqlTable: 'dictionnaire',

					prefixForID : 'dl',
					sqlKeys:"id,fr,en",
				
					receive : function( dataReceived ){
						if (!dataReceived || (dataReceived=='')) return
						if (dataReceived.dataReturned) {
							LANG.receiveDictionnaire( dataReceived.dataReturned )
							everybodyElseReceive( dataReceived, this )
						}
					},
					someoneElseReceive : function( whatWasDone, dataReceived ){
						//on compare deux niveaux d'abstraction: ayo.js/ayo.php utilisent "table_name" et au niveau plus abstrait db(view) c'est "sqlTable"
						// :-(
						if (whatWasDone.table_name == this.sqlTable) {
							//onsole.log( whatWasDone )

							if (whatWasDone.sql == 'loadMany') {
							}
							else {
								//onsole.log(". . . dictionnaireSilencieux . someoneElseReceive() :", whatWasDone )
								//2 dans le silentDict
								if (whatWasDone.column_name == 'fr') {
									LANG.add2Dict( whatWasDone.record_id, whatWasDone.column_value, null )
								}
								else {
									LANG.add2Dict( whatWasDone.record_id, null, whatWasDone.column_value )
								}
							}
						}
					}
				}
			)
			//
		}
			
		db.editDictionnary = function( view, record, oneThingToDo,  colNAME, colVALUE ) {
			var txt
			// VERIFIER SI COLNAME EST UNE LANGUE VALIDE, I.E. DONT ON A EFFECTIVEMENT UN DICTIONNAIRE!
			if (LANG.langueInconnue( colNAME )) {
				console.log( "db.editDictionnary() langue inconnue =", colNAME )
				return null
			}
			txt = LANG.trad( record[0], null, colNAME)
			if (txt==null) {
				oneThingToDo.sql = 'creates'
			}
			else {
				oneThingToDo.sql = 'modifs'
			}
			oneThingToDo.table_name = 'dictionnaire'
			oneThingToDo.record_id = record[0]
			oneThingToDo.column_name = colNAME
			oneThingToDo.column_value = colVALUE
			//
			return oneThingToDo
		}
		*/
		
		return db
	}
)