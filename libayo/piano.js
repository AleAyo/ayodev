/**
 * @license
 * piano.js - v0.1.0
 * Copyright (c) 2016, Alexandre Ayotte
 *
 * code is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */

define( 
	[ 'libayo/ayo' ],
	function( AYO ) {
		var piano = {}

		
		//s'il y a une souris, on assume qu'il n'existe pas de touch! si les deux ...bug & comportements inconnus
		function fauxMouseEvent(n) {
			return {
				identifier:n,
				target:null,
				pageX:0,
				pageY:0
			}
		}
		var fauxActiveMouse = [
			fauxMouseEvent(-2),
			fauxMouseEvent(-1),
		]
		var fauxTouchEvent = {
			type:"fauxTouchEvent",
			preventDefault:function(){},
			stopPropagation:function(){},
			changedTouches:[null,null]
		}
		//
		fauxTouchEvent.touches = fauxTouchEvent.changedTouches

		//1,2  
		// 1=shift, c'est un lock 1ere pos, l'autre fait un zoom et/ou rotation
		// 2=ctrl, c'Est un pan, les deux "doigts" se suivent à dx,dy constant

		var curDoigtSouris = 0
		var pretPourDeuxiemeDoigt = false
		function semblantDoigtYES( ev ) {
			var boutons 
			boutons = ev.buttons
			//
			var target = ev.target ? ev.target : ev.srcElement;
			//onsole.log( ev, target )
			//
			if (boutons==0) return true;
			//
			if ((ev.type == 'mousemove') && (fauxTouchEvent.changedTouches[0] == null)) {
				//onsole.log( "MOUSE MOVE .... sans avoir reçu le MOUSE DOWN ??")
				return true
			}
			
			
			var cap
			cap = AYO.findInAttributes( target, { piano:null })
			
			//var nodeName = target.nodeName.toLowerCase()
			//onsole.log( "EVENT? nodeName=",nodeName )
			//if (nodeName == "button" || nodeName == "a" || nodeName == "input" || nodeName == "textarea") {
			if (cap.piano == null) {
				//
				console.log( "semblantDoigtYES() PAS POUR NOS DOIGTS? target=", target )
				ev.returnValue = true
				return true
			}
			
			ev.preventDefault()
			ev.stopPropagation()
			fauxTouchEvent.type = "FAUX "+ev.type
			//en rollover, on fait le menage
			if (curDoigtSouris) {
				if (!(ev.shiftKey || ev.ctrlKey)) {
					//on lache le 2e doigt
					pretPourDeuxiemeDoigt = false
					if (fauxTouchEvent.changedTouches[ 1 ]) {
						doigtTermine( fauxTouchEvent )
						fauxTouchEvent.changedTouches[ 0 ] = null
						fauxTouchEvent.changedTouches[ 1 ] = null
					}
					curDoigtSouris = 0
				}
			}
			/*
			else if (ev.buttons==0) {
				if (fauxTouchEvent.changedTouches[ 0 ]) {
					doigtTermine( fauxTouchEvent )
					fauxTouchEvent.changedTouches[ 0 ] = null
					fauxTouchEvent.changedTouches[ 1 ] = null
				}
			}
			*/
			//
			//onsole.log( ev )
			var ftm, ftm0
			////////
			////////
			//
			//onsole.log( "event.type:",ev.type, "  x,y: ",ev.pageX,",",ev.pageY, "  boutons:", boutons )
			
			//if (ev.shiftKey || ev.ctrlKey) {
			//	curDoigtSouris = 1
			//}
			//else {
			//	curDoigtSouris = 0
			//}
			if (curDoigtSouris && !pretPourDeuxiemeDoigt) return false
			//
			ftm = fauxActiveMouse[ curDoigtSouris ]
			//POURQUOI?? if (fauxTouchEvent.changedTouches[ 0 ] == null) 
			ftm.target = ev.target  || ev.srcElement
			
			ftm.pageX = ev.pageX
			ftm.pageY = ev.pageY
			//
			if (ev.ctrlKey) {
				ftm0 = fauxActiveMouse[ 0 ]
				ftm0.pageX = ftm.pageX - 100
				ftm0.pageY = ftm.pageY - 100
			}
			fauxTouchEvent.changedTouches[ curDoigtSouris ] = ftm
			//
			doigtCommenceEtGlisse( fauxTouchEvent )
			return false
		}
		function semblantDoigtBYEpeutetre( ev ) {
			if ((fauxTouchEvent.changedTouches[0] != null)) {
				///// || (fauxTouchEvent.changedTouches[1] != null)) {
				//onsole.log("semblantDoigtBYEpeutetre")
				//onsole.log( "event.type:",ev.type,"  x,y: ",ev.pageX,",",ev.pageY," ev.target", ev.target )

				ev.preventDefault()
				ev.stopPropagation()
				var target = ev.target ? ev.target : ev.srcElement;

				var cap
				cap = AYO.findInAttributes( target, { piano:null, param:null })
				if (cap.piano != null) {
					//onsole.log("semblantDoigtBYEpeutetre OK, PAS DE PROBLEME")
					return false
				}
				//
				doigtTermine( fauxTouchEvent )
				fauxTouchEvent.changedTouches[0]=null
				fauxTouchEvent.changedTouches[1]=null
				pretPourDeuxiemeDoigt = false
				curDoigtSouris = 0
				return false
			}
			return true //laisse faire le event system
		}
		function semblantDoigtBYE( ev ) {
			//onsole.log( "event.type:"+ev.type+"  x,y: "+ev.pageX+","+ev.pageY )
			//
			var premDoigtNotNull
			premDoigtNotNull = (fauxTouchEvent.changedTouches[0] != null)
			
			if (premDoigtNotNull) {
				////// || (fauxTouchEvent.changedTouches[1] != null)) {
				if ((curDoigtSouris==0) && (ev.shiftKey || ev.ctrlKey)) {
					curDoigtSouris = 1
					pretPourDeuxiemeDoigt = true
				}
				else {
					doigtTermine( fauxTouchEvent )
					fauxTouchEvent.changedTouches[0]=null
					fauxTouchEvent.changedTouches[1]=null
					pretPourDeuxiemeDoigt = false
					curDoigtSouris = 0
				}

				ev.preventDefault()
				ev.stopPropagation()
				ev.returnValue = false
				return false
			}
			//onsole.log( ev )
			//
			console.log( "semblantDoigtBYE() event.type:"+ev.type+"  x,y: "+ev.pageX+","+ev.pageY )
			// les 2 pts disparaissent en même temps!
			//fauxTouchEvent.changedTouches = fauxTermineMouse
			ev.returnValue = true
			return true
		}
		
		
		function tidoigt(n,i) {
			return {
				id:n,
				numero:i,
				surquoi:null,
				target:null,
				estLeve:false, 
				combien:0,
				chemin:[],
				demarreSur:function( ceci ) {
					this.surquoi = ceci
					this.chemin = []
					this.combien = 0
				},
				retientCetEndroit:function(nx,ny, tgt) {
					this.dernPosition = {  x:nx,  y:ny,  target:tgt  }
					this.chemin.push( this.dernPosition )
					this.combien += 1
				},
				passeEtOublie:function() {
					var ch = this.chemin
					this.chemin = []
					this.combien = 0
					return ch
				},
				bidon:null
			}
		}
		//var doigtsPossibles = [ tidoigt(0), tidoigt(1), tidoigt(2), tidoigt(3)  ]
		function prochainDoigt() {
			return doigtePianoComplexe.indexOf(0)
		}
		var doigtePianoComplexe = [ 0,0,   0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0 ]
		var doigtePianoIndex =  [ 0,0,   0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0,   0,0,0,0,0 ]
		var combienDeDoigts = 0
		//IOS: PAS DES NUMEROS SIMPLE --ET-- LES NUMEROS AUGMENTENT SANS FIN  var doigtsActifs = [ 0,0,   0,0,0,0,0,   0,0,0,0,0 ]
		var doigtePrecedent = null ///NEW: on garde un seul doigt en memoire... {} /// // doigtsPrecedents = [ 0,0,   0,0,0,0,0,   0,0,0,0,0 ]
		

		var beep = true
		function doigtCommenceEtGlisse( ev ){
			//if (beep) { 
				//alert("beep"); 
				//onsole.log(ev)
			//	beep=false 
			//}
			
			//onsole.log( ev )
			//onsole.log( "event.type:"+ev.type )
			//
			var touches = ev.changedTouches;
			var t, d, no, tot, dprec, dx,dy, k,prochainLibre, tpageX,tpageY
			tot = touches.length

			//progressLN( "doigt >> type:"+ev.type+" tot: "+tot )
			
			//var mess = '** '
			var target,nodeName, cap
			for (var i=0; i<tot; i++) {
				t = touches[i]; if (t==null) continue
				target = t.target ? t.target : t.srcElement;

				cap = AYO.findInAttributes( target, { piano:null })

				if (cap.piano == null) {
					//onsole.log( "PAS POUR NOS DOIGTS? target=" )
					t.returnValue = true
					ev.returnValue = true
					return true
				}

			}
			
			ev.preventDefault()
			ev.stopPropagation()
			

			for (var i=0; i<tot; i++) {
				t = touches[i]; if (t==null) continue
				//
				
				//mess+= t.identifier +" ** "
				no = "d_"+t.identifier
				////if (no < -2 || no>10) continue
				////no += 2 //decalage pour laisser 0,1 à la souris, les vrais doigts ont 2,3,4,5,6,7...
				//
				tpageX = t.pageX - elementDeltaX
				tpageY = t.pageY - elementDeltaY
				
				if ((k = doigtePianoIndex.indexOf(no)) > -1) {
					d = doigtePianoComplexe[ k ]
				}
				else {
					prochainLibre = doigtePianoComplexe.indexOf(0)
					d = tidoigt( no, prochainLibre ) //doigtsPossibles[no]
					
					d.demarreSur( t.target )
					d.timeStamp = Date.now()
					///doigtsActifs[ no ] = d
					//
					if (dprec = doigtePrecedent) {
						dx = tpageX - dprec.dernPosition.x
						dy = tpageY - dprec.dernPosition.y
						dist = (dx*dx)+(dy*dy)
						d.doubleTape = ((dist < 400) && ((d.timeStamp - dprec.timeStamp) < 250)) //ajouter t.target = dern.target
						//if (d.doubleTape) progressLN("DOUBLE TAP "+d.id+"  "+d.numero)
					}
					//
					//pour le piano qui réagit:
					///doigtePianoComplexe.push( d )
					doigtePianoComplexe[ prochainLibre ] = d
					doigtePianoIndex[ prochainLibre ] = no
					combienDeDoigts += 1
					//progressLN('ajoute doigt n° '+prochainLibre+" tot:"+combienDeDoigts)
				}
				
				
				d.retientCetEndroit( tpageX, tpageY, t.target )
				//
				//onsole.log("    doigt: "+t.identifier+"    x,y:"+tpageX.toFixed(2)+","+tpageY.toFixed(2) )
			}
		}
		function doigtTermine( ev ){
			//onsole.log( ev )
			//onsole.log( "event.type:"+ev.type )
			var touches = ev.changedTouches;
			var i,t, d, no, tot
			tot = touches.length

			var target,nodeName,cap
			for (var i=0; i<tot; i++) {
				t = touches[i]; if (t==null) continue
				target = t.target ? t.target : t.srcElement;
				cap = AYO.findInAttributes( target, { piano:null })

				if (cap.piano == null) {
					//onsole.log( "PAS POUR NOS DOIGTS? target=" )
					t.returnValue = true
					ev.returnValue = true
					return true
				}

			}
			
			ev.preventDefault()
			ev.stopPropagation()
			
			//progressLN( "doigt << type:"+ev.type+" tot: "+tot )

			for (i=0; i<tot; i++) {
				t = touches[i]; if (t==null) continue
				no = "d_"+t.identifier
				///if (no < -2 || no>10) continue
				///no += 2 //decalage pour laisser 0,1 à la souris, les vrais doigts ont 2,3,4,5,6,7...
				//
				//d = 
				if ((k = doigtePianoIndex.indexOf(no)) > -1) {
					doigtePianoComplexe[ k ].estLeve = true
				}
				//doigtePrecedent = d
				// ICI?? delete doigtePianoComplexe[ no ]
			}
			//onsole.log("doigtTermine() doigtsActifs:", doigtsActifs)
			return false
		}
		
		function touchesDePiano( lastTime, curTime, diff ) {
			var i,tot, d, pts, doigte, prochainPiano, no, prec, qty
			//
			prochainPiano = []
			qty = combienDeDoigts
			tot = doigtePianoComplexe.length
			for (i=0; i<tot; i++) {
				if (d = doigtePianoComplexe[i]) prochainPiano.push( d )
			}
			
			//meme si vide: ça nous donne un enterframe en bonus (pas besoin d'en démarrer un autre)
			// * * * *
			if (quiGereLaPatente) quiGereLaPatente.jouerDuPiano( prochainPiano,    lastTime, curTime, diff  )
			// * * * *
			
			//
			//menage 2.0
			//prochainPiano = {}
			prec = null
			tot = prochainPiano.length
			for (i=0; i<tot; i++) {
				d = prochainPiano[i]
				if (d.estLeve) {
					prec = d
					//delete doigtePianoComplexe[ d.no ]
					doigtePianoComplexe[ d.numero ] = 0
					doigtePianoIndex[ d.numero ] = 0
					combienDeDoigts -= 1
					//progressLN( '..enlève '+d.numero+"  tot:" + combienDeDoigts )
				}
			}
			if (prec) doigtePrecedent = prec
			
			/*
			tot = doigtePianoComplexe.length
			if (tot==0) return
			//
			prochainPiano = {}
			//onsole.log()
			//onsole.log( "\ntouchesDePiano!! tot="+tot )
			for(i=0; i<tot; i++) {
				d = doigtePianoComplexe[i]
				if (!d.estLeve) prochainPiano.push( d )
			}
			doigtePianoComplexe = prochainPiano
			*/
		}
		piano.touchesDePiano = touchesDePiano
		
		//window.onmousemove = function(ev) {
		//	console.log("window ... mouse MOVE!?\n")
		//	semblantDoigtBYEpeutetre( ev )
		//}
		
		var elementDeltaX,elementDeltaY
		
		var quiGereLaPatente = null
		piano.partLaMachine = function( leGrandResponsable, leMondeVisible, msBTWNfrm, no_ill_manage_my_game_frame ) {
			quiGereLaPatente = leGrandResponsable
			
			elementDeltaX = leMondeVisible.offsetLeft
			elementDeltaY = leMondeVisible.offsetTop
			//onsole.log( "elementDeltaX,elementDeltaY:", elementDeltaX,elementDeltaY)
			
			leMondeVisible.onmousedown = semblantDoigtYES
			leMondeVisible.onmousemove = semblantDoigtYES
			leMondeVisible.onmouseup = semblantDoigtBYE
			leMondeVisible.ononmouseout = semblantDoigtBYEpeutetre
			leMondeVisible.ononmouseleave = semblantDoigtBYEpeutetre

			leMondeVisible.ontouchstart = doigtCommenceEtGlisse
			leMondeVisible.ontouchmove = doigtCommenceEtGlisse
			leMondeVisible.ontouchend = doigtTermine
			leMondeVisible.ontouchcancel = doigtTermine
			leMondeVisible.ontouchleave = doigtTermine
			
			/*
			//leMondeVisible.addEventListener( "mousedown", semblantDoigtYES )
			//leMondeVisible.addEventListener( "mousemove", semblantDoigtYES )
			//leMondeVisible.addEventListener( "mouseup", semblantDoigtBYE )

			//leMondeVisible.addEventListener( "touchstart", doigtCommenceEtGlisse )
			//leMondeVisible.addEventListener( "touchmove", doigtCommenceEtGlisse )
			//leMondeVisible.addEventListener( "touchend", doigtTermine )
			//leMondeVisible.addEventListener( "touchcancel", doigtTermine )
			//leMondeVisible.addEventListener( "touchleave", doigtTermine )
			*/
			
			if (msBTWNfrm == undefined || msBTWNfrm == null) {
				msBTWNfrm = Math.ceil( 1000.0 / 50 ); /// 1000 ms/s  /   15 frm/s  ===>  1000 ms/s  X   1/15  s/frm ===> 1000/15  ms/frm
				//onsole.log( "msBTWNfrm : "+ msBTWNfrm )
			}
			
			if (no_ill_manage_my_game_frame == undefined || no_ill_manage_my_game_frame == null) {
				console.log( "msBTWNfrm : ", msBTWNfrm )
				//progressLN( "...alors partir la frameLoop!" )
				AYO.doEachFrame( msBTWNfrm, touchesDePiano )
			}

		}
		
		return piano
	}
)