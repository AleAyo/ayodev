/**
 * @license
 * pages.js - v0.1.0
 * Copyright (c) 2016, Alexandre Ayotte
 *
 * code is licensed under the MIT License.
 * http://www.opensource.org/licenses/MIT
 */

define( 
	[ 'libayo/html', 'libayo/database' ],
	function( HTML, DB ) {
		var pageControler = {
			pages:[],
			pageVisible:null,
		}
		
		function consolelog() {}
		
		function connectDIVs( somePage ) {
			var elem,divid
			elem = document.getElementById( divid="spaceDIVfor_"+somePage.id ); if (elem==null) { console.log("DIV EXISTE PAS:", divid ); return false; } else SHIMCL(elem)
			somePage.actualDIV = elem
			elem = document.getElementById( divid="tablikeBTNfor_"+somePage.id ); if (elem==null) { console.log("DIV EXISTE PAS:",divid ); return false; } else SHIMCL(elem)
			somePage.tablikeButtonTAG = elem
			elem= document.getElementById( divid="navigLeftDIVfor_"+somePage.id ); if (elem==null) { /*console.log("DIV EXISTE PAS:", divid); return false;*/ } else SHIMCL(elem)
			somePage.navigLeftDIV = elem
			elem =document.getElementById( divid="contentRightDIVfor_"+somePage.id ); if (elem==null) { console.log("DIV EXISTE PAS:",divid ); return false; } else SHIMCL(elem)
			somePage.contentRightDIV = elem
			//
			somePage.moduleShown.attachTo( somePage.navigLeftDIV, somePage.contentRightDIV )
			return true
		}

		pageControler.connectToHTML = function( ) {
			var tot,i,somePage
			tot = this.pages.length
			for(i=0;i<tot; i++) {
				somePage = this.pages[i]
				//if (somePage.actualDIV == null) {
				if (!connectDIVs( somePage )) return
				//}
			}
		}
		function keepScroll( page ) {
		    var body = document.body
		    var docElem = document.documentElement
			page.scrollTop = docElem.scrollTop || body.scrollTop || 0
		    page.scrollLeft = docElem.scrollLeft || body.scrollLeft || 0
			//onsole.log( "keepScroll()  page.scrollTop=", page.scrollTop, "page.scrollLeft=",page.scrollLeft )
		}
		function applyScroll( page ) {
		    var body = document.body
		    var docElem = document.documentElement
			docElem.scrollTop = page.scrollTop
			body.scrollTop = page.scrollTop
		    docElem.scrollLeft = page.scrollLeft
			body.scrollLeft = page.scrollLeft
			//onsole.log( "applyScroll()  page.scrollTop=", page.scrollTop, "page.scrollLeft=",page.scrollLeft )
		}
		pageControler.emptyAll = function() {
			var tot,i,somePage,currentPage
			tot = this.pages.length
			for(i=0;i<tot; i++) {
				somePage = this.pages[i]
				if (somePage.actualDIV) somePage.actualDIV.innerHTML = ""
				somePage.actualDIV = null
			}
		}
		pageControler.show = function( thisOne ) {
			var tot,i,somePage,currentPage
			tot = this.pages.length
			if ((somePage = this.pageVisible) != null) { 
				keepScroll( somePage )
				//2017-01-30 ... avoir avertissement de réaffichage, pour pouvoir refresh si necessaire?
				if (somePage.moduleShown && somePage.moduleShown.hideAgain) {
					somePage.moduleShown.hideAgain()
				}
			}
			for(i=0;i<tot; i++) {
				somePage = this.pages[i]
				if (somePage.actualDIV == null) {
					if (!connectDIVs( somePage )) return
				}
				if (i == thisOne) {
					currentPage = somePage
					somePage.actualDIV.classList.remove( "displaynone" )
					somePage.tablikeButtonTAG.classList.add( somePage.classForTablikeBtnWhenActive )
					if (somePage.tab_hidden_at_first) {
						somePage.tablikeButtonTAG.classList.remove( "displaynone" )
						somePage.tab_hidden_at_first = false
					}
					applyScroll( somePage )
					//2017-01-30 ... avoir avertissement de réaffichage, pour pouvoir refresh si necessaire?
					if (somePage.moduleShown && somePage.moduleShown.showAgain) {
						somePage.moduleShown.showAgain()
					}
				}
				else {
					somePage.actualDIV.classList.add( "displaynone" )
					somePage.tablikeButtonTAG.classList.remove( somePage.classForTablikeBtnWhenActive )
				}
			}
			this.pageVisible = currentPage
		}
		pageControler.page = function( i ) {
			if (i>-1 && i<this.pages.length) {
				return this.pages[i]
			}
			return null
		}
		pageControler.createPage = function( i, someID, tablikeBtnActiveClass ){
			var pg = {
				no : i,
				id : someID,
				moduleShown : null,
				
				actualDIV : null,
				navigLeftDIV : null,
				contentRightDIV : null,
				
				scrollTop:0,
				scrollLeft:0,
				classForTablikeBtnWhenActive : tablikeBtnActiveClass,
				tablikeButtonTAG : null,
				neverLoaded : true,
				tabTitle : function( t ){
					if (this.tablikeButtonTAG==null) return;
					this.tablikeButtonTAG.innerHTML = t
				},
				show : function() {
					if (this.neverLoaded) {
						this.neverLoaded = false
						this.moduleShown.loadAll()
					}
					//
					//onsole.log("wow: i show myself like a boss!",  this )
					pageControler.show( i )
				}
			}
			this.pages.push( pg )
			return pg
		}
		
		function testtabclick( btn, ev, no ) {
			if (typeof pageControler.menagePage == 'function') pageControler.menagePage()
			//onsole.log( "generaltabclick", no )
			pageControler.pages[no+0].show()
			//pageControler.show( no+0 )
		}
		window.generaltabclick = testtabclick
		
		pageControler.installThesePages = function( pagesDefinitions,  containerID, tabnavigationID,  tabclassname ) {
			var tot,i, pg, def, pagesHTML, tabsHTML, unDIV, facultatif, dnone
			//tabclassname = 'class="'+tabclassname+'"'
			pagesHTML = ""
			tabsHTML = ""
			tot = pagesDefinitions.length
			for (i=0; i<tot; i++) {
				def = pagesDefinitions[i]
				pg = pageControler.createPage( i, def.id, "onglet-page-presentee" )
				//
				dnone = ''
				if (def.visible_debut === false) {
					dnone = " displaynone"
					pg.tab_hidden_at_first = true
				}
				//
				tab_divid = "tablikeBTNfor_"+def.id
				pg.tab_divid = tab_divid
				//tabsHTML += HTML.tablikeButton( tab_divid,  i,  "generaltabclick", tabclassname, def.title )
				//                          function( idbtn, numerobtn, onclickfunc, attr, texte )
				tabsHTML += "<a role='button' id='"+tab_divid+"' onclick='generaltabclick(this, event, "+i+")' class='"+tabclassname+dnone+"'>"+def.title+"</a>";
				//"spaceDIVfor_"+somePage.id
				
				if (def.col1classes) facultatif = HTML.tag( "div", 'class="'+def.col1classes+'" id="navigLeftDIVfor_'+def.id+'"', '')
				else facultatif = ''
				
				pagesHTML += HTML.tag( "div", 'id="spaceDIVfor_'+def.id+'" class="page displaynone"', 
					facultatif +
					HTML.tag( "div", 'class="'+def.col2classes+'" id="contentRightDIVfor_'+def.id+'"', '')
				)
				//
				// circular reference
				def.module.page = pg
				pg.moduleShown = def.module
				//
			}

			unDIV = document.getElementById( tabnavigationID )
			unDIV.innerHTML = tabsHTML
			unDIV = document.getElementById( containerID )
			unDIV.innerHTML = pagesHTML
			
			//onsole.log( tabsHTML )
			//onsole.log( pagesHTML )
		}


		return pageControler
	}
)