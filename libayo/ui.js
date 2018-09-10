/**
 * @license
 * ui.js - v0.1
 * Copyright (c) 2014, Alexandre Ayotte
 *
 * misc.js is licensed under the MIT License.
 * https://www.opensource.org/licenses/MIT
**/

define( 
	['pixi454/pixi', 'libayo/misc'],
	function( PIXI, MISC ) {

		var ui = {
			debog : false,
			//               1      2      3    4     5      6     7      8    9
			scales : [ 0.01, 0.25, 0.375, 0.33, 0.5, 0.625, 0.666, 0.75, 0.875, 1  ],
			sizes  : [  10,  46,   54,     60,   80,  96,   100,  120,   140,  200 ],
			coins :  [  4,   6,    8,      8,    10,  11,   12,    14,   16,  20  ],
			lineSize : [ 0,  1,    1,      2,     2,   2,    3,     3,    4,   4 ],
			lineColor : 0x2f6771,
			fillColor : 0x95e3ff, //0x77d4f4,  //0xb2f1ff, //0x95e4f6, ////0x89d3e4,  //0x59b6b9,
			textColor : 0x6fcbf0, //0x8dd0d5, //0xb7f2ff, //0xdbfbff, ///0xcef6ff,  //b2f8f3,
			textColorLT : 0x95e3ff,
			path : svp_paths( "app/media/ui/" )
			//app_paths.app + '/media/ui/'
		}
		
		ui.addBtn = function( layer, icoName, icoScale, actionOnClick, bigw, bigh ) {
			var sp,ico
			var baseAlpha = 0.8
			
			var base = new PIXI.Container()
			layer.addChild( base )
			//sp.anchor.x = sp.anchor.y = 0.5
			base.scale.x = base.scale.y = 1 //0.3333;
			base.alpha = baseAlpha
			//sp.position.x = -stgWd2 + 60
			//sp.position.y = -stgHd2 + 80
			
			var path = this.path
			var w,h,ln, coin, scale
			scale = this.scales[ icoScale ]
			coin = this.coins[ icoScale ]

			ln = this.lineSize[ icoScale ]
			w = this.sizes[ icoScale ]
			h = w - Math.floor(w/10)

			// pale 59b6b9
			// dark 2f6771
			sp = new PIXI.Graphics()
			base.addChild( sp )
	        sp.lineStyle( 0 ) //ln, this.lineColor, 1 )
			//sp.lineWidth = ln
			sp.beginFill( this.fillColor, 1 )
			sp.drawRoundedRect(-w/2, -h/2, w, h, coin)
			sp.endFill()
			
			ico = PIXI.Sprite.fromImage( path+'ico_'+icoName+'.png' )
	        ico.anchor.x = ico.anchor.y = 0.5
			ico.scale.x = ico.scale.y = scale
			
			base.btn = sp
			sp = base //TRICK ********************************** TRICK

			sp.addChild( ico )
			sp.ico = ico
			
			//sp.buttonMode = true //???
			//sp.interactive = true;
			////////sensibleArea( -w/2, -h/2, w, h )
			
			sp.updateHitArea = function() {
				this.hitArea = this.getBounds()
				//onsole.log("* * * ", this.hitArea, this.parent.position)
			}
			sp.sensibleArea = function( sx,sy, sw,sh ) {
				this.hitArea = new PIXI.Rectangle( sx, sy, sw, sh );
			}
			
			sp.recoitUnDoigt = function( doigt, dessus ){
				var ok = false
				//PAS CONVAINCU QUE UTILE::::  if (sp.paused()) { doigt.estLeve=true; this.inside=false }
				//LE "SYSTEME" DOIT METTRE SES BOUTONS HORS-SERVICE ET LE CHECK EST FAIT AVANT DE RECEVOIR-UN-DOIGT()
				//
				if (doigt.estLeve) {
					if (dessus) {
						//on a eu un mouseDOWN
						if (this.actionOnClick) {
							//console.log("mUp YES YES YES ", this)
							this.actionOnClick( doigt )
							ok = true
						}
						else {
							console.log("mUp (without an action?)")
						}
					}
					else console.log("on MOUSE UP à côté?", doigt, this )
					dessus = false
				}
				else {
					ok = true
					//
				}
				//-------------ajustement visuel
				if (dessus) {
					this.scale.x = this.scale.y = 0.98
					this.alpha = 1.0
				}
				else {
					this.scale.x = this.scale.y = 1.0
					this.alpha = baseAlpha
				}
				return ok
			}
			sp.actionOnClick = actionOnClick
			/*
			if (!bigw) bigw = w
			if (!bigh) bigh = h
			
			sp.interactive = true;
			sp.hitArea = new PIXI.Rectangle(-bigw/2, -bigh/2, bigw, bigh);
			*/
			
			//sp.inside = false
			sp.codeName = "btn_"+icoName
			
			//sp.paused = function(){ return false } //default
			
			/*
			sp.pushedOrNot = function( pushed ) {
				if (pushed) {
					this.inside = true
					this.scale.x = this.scale.y = 0.98
					this.alpha = 1.0
					return
				}
				this.inside = false
				this.scale.x = this.scale.y = 1.0
				this.alpha = baseAlpha
			}

			function myDown( ) {
			//konsole.log("mDown!!")
			//konsole.log(eventData)
				if (!sp.paused()) {
					sp.inside = true
					sp.scale.x = sp.scale.y = 0.98
					sp.alpha = 1.0
				}
				//eventData.stopPropagation();
			}
			function myLeave(  ) {
				sp.inside = false
				sp.scale.x = sp.scale.y = 1.0
				sp.alpha = baseAlpha
			}
			function myUp(  ) {
				if (!sp.paused()) {
					if (actionOnClick) {
						if (this.inside) actionOnClick(  )
					}
					else {
						console.log("mUp (without an action?)")
					}
				}
				myLeave(  )
				//eventData.stopPropagation();
			}
			*/
			//sp.mousedown = myDown
			//sp.mouseup = myUp
			//sp.mouseout = myLeave
			
			//sp.touchstart = myDown
			//sp.touchend = myUp
			//sp.touchendoutside = myLeave
			
			//sp.on('mousedown', sp.myDown);
			//sp.on('touchstart', sp.myDown);
			//sp.on('mouseup', sp.myUp);
			//sp.on('touchend', sp.myUp);
			
			return sp
		}
		
		
		//étaient dans ANIM
		function distanceEntre( p1, p2 ) {
			return {
				x: (p2.x - p1.x),
				y: (p2.y - p1.y)
			}
		}
		ui.distanceEntre = distanceEntre
		
		function hypothenuseCarree( pt ){
			return (pt.x*pt.x)+(pt.y*pt.y)
		}
		function calcVitesse( dlst, derniers ) {
			if (derniers==null || derniers==undefined) derniers = 10
			//
			var tot,i,j,d,sum,ponderation, a
			ponderation = 0.0
			sum = {x:0, y:0}
			tot = dlst.length
			a = Math.max( 0, tot-derniers )
			for(i=a, j=1; i<tot; i++, j++) {
				d = dlst[i]
				sum.x = sum.x + (d.x * j)
				sum.y = sum.y + (d.y * j)
				ponderation += j
				//onsole.log( "      j:", (i+1), "d:",d, "sum:",sum, "ponderation:",ponderation)
			}
			sum.x = sum.x / ponderation
			sum.y = sum.y / ponderation
			//onsole.log( "      sum:", sum )
			
			return sum
		}

		ui.installSwipeInteractivity = function( layer ) {
			layer.currentPosition = {x:0, y:0}
			layer.deltas = []
			layer.cumulerUnDelta = function( newPosition ) {
				var ceDelta
				this.lastPosition = this.currentPosition
				this.currentPosition = newPosition
				ceDelta = distanceEntre(this.lastPosition, newPosition)
				this.deltas.push( ceDelta )
			}
			layer.doigtQuiPousse = function( doigt ){
				//onsole.log("doigtQuiPousse........", this, doigt )
				
				if (doigt.target == null) {
					this.startPosition = pt(doigt.dernPosition)
					this.currentPosition = this.startPosition
					this.deltas = []
					//beginSwipe
					this.initialPosition = pt( this.position )
					//onsole.log("beginSwipe?", doigt, this )
				}
				else if (doigt.estLeve) {
					//fin
					this.cumulerUnDelta( pt(doigt.dernPosition) )
					//
					this.vitesseLachee = calcVitesse( this.deltas )
					this.deltas = []
					//
					var d, delta
					delta = distanceEntre( this.startPosition, this.currentPosition )
					//d = hypothenuseCarree( delta )
					//onsole.log("...endSwipe!  delta =", delta, " distance:",d, " vitesseLachee:",this.vitesseLachee)
					//if (d < 16) {
					//	//onsole.log("whatIsReallyInteractive.actionClique() ",ev ) 
					//	if (this.actionClique) this.actionClique( doigt )
					//}
					if (this.endSwipe) {
						this.endSwipe( delta, this.vitesseLachee )
					}
				}
				else {
					//durant
					this.cumulerUnDelta( pt(doigt.dernPosition) )
					//
					var delta = distanceEntre( this.startPosition, this.currentPosition )
					var pos = this.initialPosition
					this.position.x = pos.x + delta.x
				}
			}
		}
		
		
		var path = svp_paths( "app/media/" )
		//var doigtCouleurs = [ '#333', '#bbb',   '#f00', '#aa0', '#0f0', '#44f', '#b33',   '#4f4', '#f72', '#ff7', '#a4a', '#449' ]
		//debog doigts
		function prepareDoigts( layer, tot ) {
			var i,pts,pt,circ,c,h
			pts = []
			for(i=0;i<tot;i++) {
				//h = doigtCouleurs[i]
				//var c = MISC.hex2rgb(h)
				//circ = ANIM.getPetitCercle( layer,  0, 0,  70,   c.r, c.g, c.b,   64 )
				circ = PIXI.Sprite.fromImage( path +"doigt.png" )
				layer.addChild( circ )
				circ.anchor.x = circ.anchor.y = 0.5;
				circ.scale.x = circ.scale.y = 1.5;
				circ.alpha = 0.35
				
				circ.visible = false
				pts.push( circ )
			}
			return pts
		}
		
		var tempPoint
		tempPoint = {x:0, y:0}
		function showDoigts( luimeme, someFingers ) {
			var i,tot,d,circ,p,  zonesDoigts
			zonesDoigts = luimeme.zonesDoigts
			tot = zonesDoigts.length
			for(i=0; i<tot; i++) {
				circ = zonesDoigts[i]
				circ.visible = false
				//c.position.x = -100
				//c.position.y = -100
			}
			var layer = luimeme.layer
			tot = someFingers.length
			for(i=0; i<tot; i++) {
				d = someFingers[i]
				if (!d.estLeve) {
					circ = zonesDoigts[ d.numero ]
					xy = d.dernPosition
					layer.worldTransform.applyInverse( xy,  tempPoint );
					circ.visible = true
					circ.position.x = tempPoint.x
					circ.position.y = tempPoint.y
				}
			}
			
		}
		function fouilleUnPeu( ceci, tempPoint ) {
			//console.log("..fouilleUnPeu() ceci=", ceci)
			var children,i,tot,objet, enfant
			children = ceci.children
			tot = children.length - 1
			for(i=tot; i>=0 ; i--) {
				objet = children[i]
				if (objet.contientDesTouchables) {
					enfant = fouilleUnPeu( objet, tempPoint )
					if (enfant != null) return enfant
				}
				if (objet.visible && objet.recoitUnDoigt && (!objet.horsService)) {
					if (!objet.hitArea) objet.updateHitArea()
					//
					if (objet.hitArea.contains( tempPoint.x, tempPoint.y )) {
						//onsole.log(".....fouilleUnPeu() objet.recoitUnDoigt !! ", objet.hitArea, tempPoint, objet )
						return objet
					}
				}
			}
			if (ceci.recoitUnDoigt && ceci.infini) {
				console.log("ceci.recoitUnDoigt && ceci.infini : ",ceci)
				return ceci
			}
			//
			return null
		}
		ui.installerGestionDesDoigts = function( ceLayer, avecTracesDeDoigts ) {
			if (avecTracesDeDoigts) ceLayer.zonesDoigts = prepareDoigts( ceLayer.layer, 10 )
			
			ceLayer.doigtsDessus = function ( doigtsQuiTouchent ) {
				if (avecTracesDeDoigts) showDoigts( this, doigtsQuiTouchent )
				//--1-- 
				// si on touche un bouton, on ignore les autres doigts?
				// OU si un doigt, les boutons sont consultés
				// si deux+ alors on pan/swipe etc
				var btn,tot,i,layer,children,objet,doigt, dessus
				layer = this.layer
				var qty = doigtsQuiTouchent.length
				if (qty==0) return //
				if (qty==1) {
					dessus = true 
					doigt = doigtsQuiTouchent[0]
					//layer.worldTransform.applyInverse( doigt.dernPosition,  tempPoint );
					tempPoint = {x:doigt.dernPosition.x, y:doigt.dernPosition.y}

					if (doigt.target == null) {
						//cherche un truc qui ferait l'affaire
						//NOTE: LE PREMIER LAYER EST réputé "FOUILLABLE"
						btn = fouilleUnPeu( layer, tempPoint )
						//
						//NOT USEFUL ANYMORE::::  peut-être que oui
						if (btn==null) {
							//onsole.log("On a trouvé aucun btn, on prends")
							if (layer.recoitUnDoigt) btn = layer
							if (this.recoitUnDoigt) btn = this
							//if (btn!=null) console.log("On a trouvé aucun btn, ...alors on prends ceLayer ou THIS")
						}
						//onsole.log("on a trouvé cet objet : ", btn)
					}
					else {
						//ICI ON S'EN FOUT SI INSIDE OU NON?
						btn = doigt.target
						//
						if (btn && btn.hitArea) dessus = btn.hitArea.contains( tempPoint.x, tempPoint.y )
						//onsole.log("on connait l'objet, YÉ: ", btn.hitArea, dessus, tempPoint )
					}
					//securité
					if (btn==null) {
						console.log("bizarre!! personne ne peut recevoir le bouton!!??", layer)
					}
					else {
						if (btn.recoitUnDoigt( doigt, dessus )) doigt.target = btn
					}
					return
				}
				if (qty >= 2) {
					if (this.recoitPlusieursDoigts && this.recoitPlusieursDoigts( doigtsQuiTouchent )) {
						//patch... on devrait mettre chacun des doigts à .target=this
						//PIRE: on commence toujours à 1 doigt, le 2e se rajoute
						//DONC: c'est le 2e doigt qu'on a besoin pour savoir que ça commence!!!!
						//logique!
						doigtsQuiTouchent[1].target = this
					}
					//peut-être qu'on devrait s'en tenir à 1 doigt dans ce jeu?
				}
			}
		}
		
		

		return ui
	}
)
