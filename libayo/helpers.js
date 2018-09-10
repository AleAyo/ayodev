/**
 * @license
 * helpers.js
 * Copyright (c) 2015, Alexandre Ayotte
 *
 * code is licensed under the MIT License.
 * http://www.opensource.org/licenses/MIT
 */

define( 
	['libayo/ayo', 'libayo/misc', 'libayo/lang'],
	function( AYO, MISC, LANG ) {
		var helpers = {}
		var somecodes,i
				
		
		var menus = {}
		helpers.menus = menus
		

		var apost = /'/g;
		

		function prepareHTMLpourCeMenu( celuila, xtrastyl, funcName ) {
			var tot,i, vals, explics, output, agg, vi, xpli
			xtrastyl = celuila.xtrastyl || ''
			funcName = funcName || 'pasteHelpComplex'
			output = ''
			agg = (celuila.agglomerer) ? 'true' : 'false';
			vals = celuila.vals
			explics = celuila[ LANG.CURLANG ]//    fr  |  en
			tot = vals.length
			output += '<div class="list-group" style="margin-bottom:0;'+ xtrastyl +'">'
			for (i=0; i<tot; i++) {
				vi = vals[i]
				xpli = explics[i].replace( apost, '’' );
				output += '<div role="button" onmousedown="'+funcName+'(event,\''+vi+'\',\''+xpli+
				'\', '+agg+');" oncontextmenu="'+funcName+'(event,\''+vi+
				'\', '+agg+');" class="list-group-item"><span class=floatingcode>'+vi+'</span>'+xpli+'</div>'
			} //style="padding-top:2px;margin-bottom:2px"
			output += '</div>'
			return output
		}
		helpers.prepareHTMLpourCeMenu = prepareHTMLpourCeMenu
		
		
		helpers.addDynamicMenu = function( nom, celuila ){
			menus[ nom ] = celuila
		}

		helpers.makeMenu = function( def ){
			var grpnm, grpdb, agglom
			grpnm = def[0]
			grpdb = def[1]
			agglom = def[2]
			//
			var a=[], b=[], c=[]
			var tot,i, records, r, r4
			records = LANG.filterGroup( grpdb )
			//console.log("MAKELISTE() grpnm,grpdb=",grpnm, grpdb, records)

			tot = records.length
			for(i=0; i<tot; i++) {
				r = records[i]
				a.push( r[2] )
				b.push( r[3] )
				r4 = r[4]
				if (r4) c.push( r4 ); 
				else c.push( r[3] )
			}
			var celuila = {
				vals: a,
				fr:b, 
				en:c
			}
			//
			if (agglom) celuila.agglomerer = true
			//
			//onsole.log("menu:", grpnm, grpdb, "total:", tot, a )
			celuila.HTML = prepareHTMLpourCeMenu( celuila )
			//
			menus[ grpnm ] = celuila
		}
		
		/* ----- EXEMPLES ------------------
		someMenus = [
					menu    dict.grp   agglom
				['douleurs', 'carac', true ], 
				['couleurs', 'couleurs', false], 
				['regiongeo', 'geo', true ]
			]
		*/
		
		helpers.makeManyMenus = function( someMenus ) {
			var tot,i,def,a
			tot = someMenus.length
			for(i=0; i<tot; i++) {
				def = someMenus[i]
				helpers.makeMenu( def )
			}
		}

		/*----adaptée bilingue de vieille facon----------
		helpers.extractHelper =         function( view, filterCol, filterVal, accumulCol ) {
		*/
		helpers.extractFromSomeDBView = function( view, filterCol, filterVal, altFRcol ) {
			var a=[], b=[], id=[]
			var tot,i, records, r, tout
			var fc,ac,bc
			fc = view.columnNames.indexOf( LANG.CURLANG )
			if (altFRcol) {
				ac = view.columnNames.indexOf( altFRcol )
				bc = ac
			}
			else {
				ac = view.columnNames.indexOf( 'fr' )
				bc = view.columnNames.indexOf( 'en' )
				if (bc<0) bc = ac;
			}
			//
			if (view.column2record) {
				fc = view.column2record[ fc ]
				ac = view.column2record[ ac ]
				bc = view.column2record[ bc ]
			}
			tout = ((filterVal == '*') || (filterVal == undefined))
			records = view.someRecords
			tot = records.length
			for(i=0; i<tot; i++) {
				r = records[i]
				if ((tout) || (r[fc] == filterVal)) {
					id.push( r[0] )
					a.push( r[ac] )
					b.push( r[bc] )
				}
			}
			
			////////evaluer possibilité de traduire via le dictionnaire, les valeurs de altFRcol.... ??
			//tot = a.length
			//for(i=0; i<tot; i++) {
			//	b.push( traduc( id[i], 'FR.'+id[i]) )
			//}
			////for(i=0; i<12; i++) {
			////	console.log( "      extractHelper():",i, a[i], b[i] )
			////}
			//////////
			
			return {
				vals: id,
				fr : a,
				en : b
			}
		}
		//*/
		


		// API implemented in EDIT.JS
		//THIS ONE IS OVERLOADED, POUR PERMETTRE DE SAUVER UN CODE MAIS AFFICHER LE TEXTE [POUR UNE MÊME CELLULE VISUELLE]
		//window.pasteHelpText = function( ev, htxt, agglomerer ){
		//	console.log("HELPERS ======================>>> SHOULD paste this : ",htxt)
		//}
		//LEGACY: maintenant on devrait fournir un nom de function à appeller, et s'assurer que window.someFunc soit définie
		////window.pasteHelpComplex = function( ev, idORcode, htxt, agglomerer ) {
		////	//onsole.log("HELPERS ======================>>> SHOULD paste this : ",idORcode, htxt)
		////}
		
		// La fouinne retourne une sélection parmi les allRecords d'un select db
		// si elle utilise des données non-DB, il faut faire semblant d'une view minimale: { columnNames, ikey, allRecords }
		helpers.prepareHTMLmenuAvecSomeRecords = function( view, someRecords, codeORid, colToShow, funcName, xtrastyl ) {
			var tot,i, output, agg, vi, xpli,xplivisib, rec, ac,bc,ic
			xtrastyl = xtrastyl || ''
			funcName = funcName || 'pasteHelpComplex'
			colToShow = colToShow || LANG.CURLANG
			output = ''

			ic = view.columnNames.indexOf( codeORid )
			ac = view.columnNames.indexOf( colToShow )
			exact = view.firstSearchIsExact
			
			agg = 'true';///WARNING: C'EST OUBLIÉ DONC agg ==was== undefined

			tot = someRecords.length
			output += '<div class="list-group" style="margin-bottom:0;'+ xtrastyl +'">'
			for (i=0; i<tot; i++) {
				rec = someRecords[i]
				vi = rec[ ic ]
				xpli = rec[ ac ].replace( apost, '’' );
				xplivisib = xpli;
				if (exact && (i==0)) {
					//onsole.log("EXACT MATCH:", xplivisib )
					xplivisib = "<b>"+xpli+"</b>";
				}
				//
				output += '<div role="button" onmousedown="'+funcName+'(event,\''+vi+'\',\''+xpli+
				'\', '+agg+');" oncontextmenu="'+funcName+'(event,\''+vi+
				'\', '+agg+');" class="list-group-item">'+xplivisib+'</div>'   
				//<span class=floatingcode>'+vi+'</span>
			} 
			//style="padding-top:2px;margin-bottom:2px"
			output += '</div>'
			return output
		}
		
		
		// TADA :
		// Dans le cas de DB immense, on lance la recherche LIKE = %aiguille%, LIMIT 50
		// ajouter envoyer aiguille_regexp prémâchée avec |a|b|c ....
		// à la réception, la Fouineuse fait juste classer les résultats selon exa, deb, enf
		function fouinetteAZero(f) {
			f.trouvee = []
			f.rendu = 0
		}
		helpers.fouineuse = {
			exacte : null,
			debutent : null,
			enfouies : null,
			granulees : null,
			granulee2 : null,
			
			idc:0, 
			//BUG SI VIEW EDITEDtxtc:{fr:0, en:0}, ///doivent être les # de colonnes cachées frLOWERCASE, enLOWERCASE
			
			finie : false,
			prochain : 0,
			combien : 100,
			colonneLang : 0,
			colonneLangAlt : 0,
			assez : 20,
			fouine : function() {
				//une ou quelques recherches, 
				var exa,deb,enf,gra,gr2, i,com,aig,aigRGXand,aigRGXor,aigRGX, bdf, prochain,totbdf,curlang,altlang
				var totalacc
				exa = this.exacte; deb = this.debutent; enf = this.enfouies; gra = this.granulees; gr2 = this.granulee2
				com = this.combien
				prochain = this.prochain
				bdf = this.bottedefoin.allRecords
				totbdf = bdf.length
				aig = this.aiguille
				aigRGXand = this.aiguilleREGEXand
				aigRGXor = this.aiguilleREGEXwords
				aigRGX = this.aiguilleREGEX
				//
				curlang = this.colonneLang
				altlang = this.colonneLangAlt
				if ((curlang<0) && (altlang<0)) {
					console.log("Mauvaises colonnes à chercher")
					this.finie = true
					return this.assez
				}
				//
				totalacc = (exa.length+deb.length+enf.length+gra.length+gr2.length)
				//
				var rec,itm,i,ici
				if ((prochain >= totbdf) || (totalacc >= this.assez)) {
					this.finie = true
					return this.assez
				}
				//
				for(i=0; i<com; i++) {
					rec = bdf[prochain]
					//onsole.log(i, rec)
					itm = rec[curlang]
					if ((itm=='') && (altlang>-1)) {
						itm = rec[altlang]
					}
					if (itm == '') continue
					//console.log(i, itm)
					//
					if (aig == itm) {
						//console.log("...exact match")
						exa.push( prochain )
						totalacc++
					}
					else {
						//
						ici = itm.search( aigRGX )
						if (ici == 0) {
							//console.log("...au début")
							deb.push( prochain )
							totalacc++
						}
						else if (ici > 0) {
							//console.log("...perdu dedans")
							enf.push( prochain )
							totalacc++
						}
						else if (aigRGXand) { //and
							ici = aigRGXand.test( itm )
							//onsole.log( prochain,ici, "["+aigRGXand+"] in ["+itm+"]" )
							if (ici) {
								gra.push( prochain )
								totalacc++
							}
							else if (aigRGXor) { //or
								ici = aigRGXor.test( itm )
								//onsole.log( prochain,ici, "["+aigRGXor+"] in ["+itm+"]" )
								if (ici) {
									gr2.push( prochain )
									totalacc++
								}
							}
						}
					}
					
					//
					//onsole.log( prochain,ici, "["+aig+"] in ["+itm+"] --> ", exa, deb, enf )
					prochain += 1;
					//
					this.prochain = prochain
					if (prochain >= totbdf) {
						this.finie = true
						console.log("--->fin de la liste. ", AYO.getNow())
						//
						console.log( prochain,ici, " --> ", exa, deb, enf, gra, gr2 )
						return this.assez
					}
				}
				// false: arrête de la recherche (enlever le spinner qui tourne)
				////////var totalacc = (exa.length+deb.length+enf.length+gra.length+gr2.length)
				if (totalacc >= this.assez) {
					this.finie = true
					console.log("--->on en a assez trouvé. ", totalacc, AYO.getNow())
					//
					console.log( prochain,ici, " --> ", exa, deb, enf, gra, gr2 )
					return this.assez
				}
				this.finie = false
				//console.log( prochain,ici, " --> ", exa, deb, enf, gra, gr2 )
				//onsole.log("totalACCUMULEES = ",totalacc)
				//
				return totalacc
			},
			resultats : function() {
				var exa,deb,enf,gra,gr2, i,tot,bdf,trouvailles, k
				exa = this.exacte; deb = this.debutent; enf = this.enfouies; gra = this.granulees; gr2 = this.granulee2
				com = this.combien
				prochain = this.prochain
				bdf = this.bottedefoin.allRecords
				trouvailles = []
				
				tot = exa.length
				this.bottedefoin.firstSearchIsExact = (tot>0)
				for(i=0;i<tot;i++) {
					k = exa[i]
					trouvailles.push( bdf[k] )
				}
				
				tot = deb.length
				for(i=0;i<tot;i++) {
					k = deb[i]
					trouvailles.push( bdf[k] )
				}
				tot = enf.length
				for(i=0;i<tot;i++) {
					k = enf[i]
					trouvailles.push( bdf[k] )
				}
				tot = gra.length
				for(i=0;i<tot;i++) {
					k = gra[i]
					trouvailles.push( bdf[k] )
				}
				tot = gr2.length
				for(i=0;i<tot;i++) {
					k = gr2[i]
					trouvailles.push( bdf[k] )
				}
				//
				//console.log( "trouvailles", trouvailles, "   this.bottedefoin.firstSearchIsExact=", this.bottedefoin.firstSearchIsExact )
				return trouvailles
			},
			aiguille : null,
			aiguilleREGEX : null,
			aiguilleREGEXwords : null,
			aiguilleREGEXand : null,
			bottedefoin : null, //la view au complet, pas juste les allRecords
			recommence : function( nouvelleAiguille, viewCommeBotteDeFoin, columnToSearch ){
				nouvelleAiguille = nouvelleAiguille.trim().toLocaleLowerCase()
				//
				if ((this.aiguille == nouvelleAiguille) && (this.bottedefoin == viewCommeBotteDeFoin)) {
					console.log("pas besoin")
					return false
				}

				this.aiguille = nouvelleAiguille
				this.aiguilleREGEX = new RegExp( nouvelleAiguille, "i" )
				
				var p = nouvelleAiguille.split(' ')
				var tot,i,itm, lst=[], lstAND=[]
				tot = p.length
				if (tot>1) {
					for(i=0; i<tot; i++) {
						itm = p[i]
						lst.push( "(?=.*\\b" + itm + ")" )
						lstAND.push( "(?=.*\\b" + itm + "(\\b\$))" )
					}
					this.aiguilleREGEXwords = new RegExp( lst.join(''), 'gi' )  ///lst.join('|')
					this.aiguilleREGEXand = new RegExp(lstAND.join(''), 'gi')
				}
				else {
					this.aiguilleREGEXwords = null
					this.aiguilleREGEXand = null
				}
				var bdf,rec,fri,eni, frv,env
				this.bottedefoin = viewCommeBotteDeFoin
				
				if (columnToSearch) {
					this.colonneLang = this.bottedefoin.ikey( columnToSearch )
					this.colonneLangAlt = -1
				}
				else {
					var alt
					if (LANG.CURLANG=='fr') alt = 'en'; else alt = 'fr';
					this.colonneLang = this.bottedefoin.ikey( LANG.CURLANG )
					this.colonneLangAlt = this.bottedefoin.ikey( alt )
				}
				
				
				console.log( columnToSearch, this.colonneLang,this.colonneLangAlt, this.bottedefoin.columnNames )
				this.bottedefoin.firstSearchIsExact = false

				this.exacte = [] 
				this.debutent = []
				this.enfouies = []
				this.granulees = []
				this.granulee2 = []
				this.prochain = 0
				this.finie = false
				//
				//console.log( "fouine.prepare()!!!!!!!!!!!!",this )
				//console.log( this.aiguilleREGEX )
				//console.log( this.aiguilleREGEXand )
				
				return true
			}
		}
		
		


		return helpers
	}
)