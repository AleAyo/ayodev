/**
 * @license
 * anim.js - v0.2.0
 * Copyright (c) 2014, Alexandre Ayotte
 *
 * this code is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */

define( 
	['pixi454/pixi', 'libayo/misc'],
	function( PIXI, MISC ) {

		Math.PIdiv180 = Math.PI / 180.0
		Math.i180divPI = 180.0 / Math.PI
		Math.rad = function(degrees) { return degrees * Math.PIdiv180 }
		Math.deg = function(radians) { return radians * Math.i180divPI; }
		
		function doEachFrame( msBTWNfrm, callMePlease ) {
			var now,last,diff,eachfrm,rest
			last = AYO.getNow()
			eachfrm = msBTWNfrm
			var gimmeAnAnimationFrame = window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame    ||
				window.oRequestAnimationFrame      ||
				window.msRequestAnimationFrame     ||
				function(what) { what() } ;
			function oneFrame() {
				now = AYO.getNow()
				diff = now - last
				if (diff >= eachfrm) {
					//
					callMePlease( last, now, diff, 0 )
					//
					//on inclut le temps perdu dans ce IF
					//et diminuer le next frm delay
					now = AYO.getNow()
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

		function applyBasePath( b, arr ) {
			var i,tot=arr.length
			var sb = b.toString()
			for(i=0; i<tot; i++){
				arr[i] = sb + arr[i]
			}
		}
		function loadMany( these, thenDoThis ) {
			//var loader = new PIXI.AssetLoader( these )
			var loader = new PIXI.loaders.Loader(); //(baseDir, 10)
			var tot=these.length, i
			for(i=0; i<tot; i++) { //			for (var that in these) {
				loader.add( these[i] )
			}
		    //loader.onComplete = thenDoThis
		    loader.load( thenDoThis )
		}
		function loadManyAndForEach( these, doThisWithEach, thenDoThis ) {
			var loader = new PIXI.AssetLoader(these)
		    loader.onProgress = doThisWithEach
		    loader.onComplete = thenDoThis
		    loader.load()
		}


		var rad360 = Math.rad(360)
		
		function newAdditive( vitesseOscillation, amplitudeOscillation, pourCentPause, useMult ) {
			var osc
			if (pourCentPause == null) pourCentPause = 1.01
			//isDAProp = (typeof vitesseOscillation == "string")
			//isDRProp = (typeof amplitudeOscillation == "string")
			osc = {
				a : 0,

				drOffset : 0,
				retard : 0,

				da : vitesseOscillation, //si ce sont des noms de property: ca permet de changer LIVE l'oscillation
				dr : amplitudeOscillation,

				daPause : pourCentPause,
				mult : (useMult == true)
			}
			
			osc.reset = function() {
				this.a = 0
			}
			osc.oscille = function( valeur ) {
				var r, a, sina, drMsina
				//
				//new 2014
				if (this.retard>0) {
					this.retard = this.retard-1
					return valeur
				}
				a = (this.a + Math.rad( this.da )) % rad360
				sina = Math.sin(a)

				if (Math.abs(sina) < this.daPause) {
					drMsina = (this.dr * sina)
					if (this.mult) {
						r = valeur * (1 + drMsina + this.drOffset)
					}
					else {
						r = valeur + drMsina + this.drOffset
					}
				}
				else {
					r = valeur
				}
				//
				this.a = a
				//
				return r
			}
			
			return osc
		}
		function newMultiplicative( vitesseOscillation, amplitudeOscillation, pause ) {
			return newAdditive( vitesseOscillation, amplitudeOscillation, pause, true )
		}
		function oscilleurDeScale( that, vit, amp, pause, retard ) {
			var mult = newAdditive( vit, amp, pause, true )
			mult.retard = retard
			return {
				r0:that.scale.x,
				osc: mult,
				what: that,
				oscille: function() {
					var sc = this.osc.oscille( this.r0 )
					this.what.scale.x = this.what.scale.y = sc
				}
			}
		}
		function oscilleurDeRotation( that, vit, amp, pause, retard ) {
			var mult = newAdditive( vit, amp, pause, false )
			mult.retard = retard
			return {
				r0:null,//plus tard, pas encore initialisé!
				osc: mult,
				what: that,								////// ====== RADIAN ====== grrrr
				oscille: function() {
					if (this.r0 == null) this.r0 = Math.deg(that.rotation)
					var sc = this.osc.oscille( this.r0 )
					this.what.rotation = Math.rad( sc )
				}
			}
		}


		
		function newGroup( layer, dx,dy ) {
			var g
			g = new PIXI.Container()
			g.position.set( dx, dy )
			//
			layer.addChild( g )
			return g
		}
		
		function newImage( layer, path_and_imgname, dx,dy ) {
			var img
			img = PIXI.Sprite.fromImage( path_and_imgname+'.png' )
			img.position.set( dx, dy )
	        img.anchor.x = img.anchor.y = 0.5
			img.scale.x = img.scale.y = 1
			//
			layer.addChild(img)
			return img
		}
		
		//traduit de lua : movieClip.newAnim
		function newAnim( layer, prefix, suffix, n, dx,dy ) {
			if (suffix==null) suffix=''

			var i, diz,uni
			var g
			g = newGroup( layer, dx,dy )
			
			g.animFrames = [0]  //trick : pour commencer à UN
			g.animLabels = [0]
			
			g.vitesse = 3
			g.curVite = 0
			
			var img, name
			for (i=1; i<=n; i++ ) {
				diz = Math.floor(i / 10)
				uni = i % 10
				name = prefix + "00"+ diz+uni +suffix //+ ".png"
				img = newImage( g, name, 0,0 )
				img.visible = false 
				g.animFrames.push( img )
				g.animLabels.push( i )
			}
			
			g.currentFrame = 1
			g.nextFrame = 1

			g.totalFrames = 0
			g.startFrame = 1
			g.endFrame = 0
			g.loop = 0

			g.finished = true
			g.onFrame = false

			g.triggerAtStop = null //--2012 arvil 19 : new a trigger when the anim stops
			//--AA 2011 oct 15 :: ajout de liste d'index à afficher (en loop ou non)
			//--donc le reverse devient inutile, et on a plus de marge pour des animations qui skippe certains frames/ou en double...
			g.currentSequence = null
			
			g.changeSequence = function( newSequence ) {
				if (newSequence != null) {
					this.hideFrame()
				}
				else {
					newSequence = this.animLabels
				}
				this.nextFrame = 1
				this.startFrame = 1
				this.endFrame = newSequence.length - 1
				this.currentSequence = newSequence
				this.finished = true //---pour pas que stop() de précaution fasse qq chose!!
				this.curVite = 0
			}
			g.resetDefaults = function() {
				var self = this
				self.changeSequence( null )
				//--
				self.currentFrame = 1
				self.vitesse = 0
				self.curVite = 0
				self.loop = 0
			}
			g.changeVitesse = function( v ) {
				var self = this
				if (v == self.vitesse) return;
				self.vitesse = v
				self.curVite = self.vitesse
			}
			g.slowFrame = function() {
				var self = this
				if (self.vitesse>0) {
					if (self.curVite>0) {
						self.curVite = self.curVite - 1
						return true
					}
					else {
						self.curVite = self.vitesse
					}
				}
				return false //--show next/prev frame...
			}
			g.playThis = function( newSequence ) {
				var self = this
				self.changeSequence( newSequence )
				//--
				self:showFrame()
				self.currentFrame = 0 //---trucage, parce que le enterFrame arrive trop vite??
				//--
				self.finished = false
			}
			g.hideFrame = function() {
				var self = this
				var j = -99
				if (self.currentFrame > 0) {
					if (self.currentSequence != null) {
						j = self.currentSequence[ self.currentFrame ]
						if ((j != null) && (j>0)) {
							self.animFrames[j].visible = false
						}
					}
				}
				self.currentFrame = 0
				return j
			}
			g.showFrame = function() {
				var self = this
				var j=-999
				var j2=-999
				var dbg = null
				//
				j = self.hideFrame()
				//		
				if (self.nextFrame > 0) {
					j2 = self.currentSequence[ self.nextFrame ]
					if ((j2 != null) && (j2>0)) { 
						dbg = self.animFrames[j2]
						dbg.visible = true 
					}
				}
				
				self.currentFrame = self.nextFrame
				return j2
			}
			//
			//================PROBLEME=================
			// dans LUA/CORONA les movieClip roulent "tout seuls"
			// dans PIXI y a pas de global enterframe event...
			//
			// donc va falloir traiter ça comme des parties qui "oscille"
			// ca va permettre de faire PAUSE dans un objet!
			g.oscille = function() {
				var self = this
				if (self.finished) return;
				//--------------------------------
				self.onFrame = false
				if (self.slowFrame()) return;
				//
				self.onFrame = true
				self.nextFrame = self.currentFrame + 1
				if (self.nextFrame > self.endFrame) {
					if (self.loop > 0) {
						self.nextFrame = self.startFrame
					}
					else {
						self.stop()
						return
					}
				}
				self.showFrame()
			}
			g.isPlaying = function() { 
				return !this.finished
			}
			g.stop = function() {
				var self = this
				var postTrigger = false
				if ((!self.finished) && (self.triggerAtStop != null)) {
					postTrigger = true
				}
				self.finished = true
				if (postTrigger) {
					self.triggerAtStop()
				}
			}
			g.stopAtFrame = function(label) {
				this.stop()
				this.nextFrame = label
				this.showFrame()
			}
			g.playAtFrame = function(label) {
				this.stop()
				this.nextFrame = label
				this.finished = false
				this.showFrame()
			}
			
			g.resetDefaults()
			g.stopAtFrame(1)
			
			return g
		}
		var qqp_w,qqp_h,qqp_a,qqp_b
		function changeZoneQuelquePart(w,h,a,b) {
			console.log("changeZoneQuelquePart(w,h,a,b)=",w,h,a,b)
			qqp_w = w; qqp_h = h; qqp_a = a;  qqp_b = b
		}
		changeZoneQuelquePart( 750, 400, -10, 40 )
		function quelquePart( w, h, x,y ) {
			var xx,yy, hhh,www,xxx,yyy
			//le tout est centré!!! donc de -1/2 à +1/2
			if (h) hhh = h/2; else hhh=qqp_h/2
			if (w) www = w/2; else www=qqp_w/2
			if (x) xxx = x; else xxx=qqp_a
			if (y) yyy = y; else yyy=qqp_b
			xx = MISC.hazR(-www, www) + xxx //MISC.hazR(qqp_a,qqp_b)
			yy = MISC.hazR(-hhh, hhh) + yyy /// MISC.hazR(qqp_a,qqp_b)
			//MISC.hazR(-550,180) + MISC.hazR(-10,40)
			return {x:xx,y:yy}
		}

		function getContourRectangle( deQuoi, rect ) {
			sp = new PIXI.Graphics()
			deQuoi.addChild( sp )
	        sp.lineStyle( 2, 0xffff00, 1 )
			//var rect = deQuoi.hitArea
			//onsole.log( "getContourRectangle() deQuoi.hitArea: ", rect )
			sp.drawRect( rect.x, rect.y,  rect.width, rect.height )
			sp.visible = false
			deQuoi.hiliteRect = sp
		}
		function getPetitCercle( base, xx,yy, rayon, r,g,b,a ) {
			var sp,coul
			sp = new PIXI.Graphics()
			base.addChild( sp )
			coul = MISC.rgb(r,g,b)
	        sp.lineStyle( 2, coul, 1 )
	        //sp.lineColor = coul ////PIXI.color()
			//sp.lineWidth = 2 //ln
			if (a>0) sp.beginFill( coul, a/255 )
			sp.drawCircle( xx, yy, rayon )
			if (a>0) sp.endFill()
			return sp
		}
		function showContacts( obj, pts, r,g,b ) {
			if (r == undefined) { r=255; g=0; b=0 }
			var i,tot,pt,circ
			tot = pts.length
			for(i=0;i<tot;i++) {
				pt = pts[i];
				circ = getPetitCercle( obj, pt[0], pt[1], 4.5, r,g,b,64 )
			}
		}
		

		function consolelog(){}




		function entreIciEtLabas( ici, labas ) {
			var r
			var dx,dy
			//--
			dx = labas.x - ici.position.x
			dy = labas.y - ici.position.y
			r = MISC.in360( Math.deg( Math.atan2(dy,dx) ) )
			//--print("  beta =     ",r, dx,dy)
			//--
			if (!ici.angledxdy) ici.angledxdy = {}
			//
			ici.angledxdy.angle = r
			ici.angledxdy.dx = dx
			ici.angledxdy.dy = dy
			//
		}
		
		//dans trucmuche
		function zoneCliquable( layer ){
			//test click
			var r = layer.getLocalBounds()
			layer.hitArea = r
			ANIM.getContourRectangle( layer, r )
		}
		
		
		
		var tempPoint;
		tempPoint = {x:0, y:0} ///bout de chandelle
		
		function checkIfTouched( objetVisee, aCetEndroit, accumulerIci ) {
			if (objetVisee.zoneDeContact) {
				objetVisee.worldTransform.applyInverse( aCetEndroit,  tempPoint );
				//onsole.log( level+"trouverObjetsSensibles()",aCetEndroit, tempPoint, racine.hitArea, racine )
				if (objetVisee.zoneDeContact.contains( tempPoint.x, tempPoint.y )) {
					//if (p.hiliteRect) {
					//	p.hiliteRect.visible = true
					//	p.hiliteRect.alpha = Math.min( 100, Math.max(0, 100-(accumulerIci.length * 30)) ) / 100.0
					//}
					accumulerIci.push( objetVisee )
				}
				//else {
				//	if (p.hiliteRect) p.hiliteRect.visible = false
				//}
			}
		}

		

		return {
		
			//AYO!! (pcq piano aussi) 'doEachFrame':doEachFrame,
		
			'applyBasePath': applyBasePath,
			'loadMany':loadMany,
			'loadManyAndForEach':loadManyAndForEach,

			'newAdditive':newAdditive,
			'newMultiplicative':newMultiplicative,
			
			'oscilleurDeScale':oscilleurDeScale,
			'oscilleurDeRotation':oscilleurDeRotation,
			
			'quelquePart':quelquePart,

			'changeZoneQuelquePart':changeZoneQuelquePart,
			'entreIciEtLabas':entreIciEtLabas,
						
			'newGroup':newGroup,
			'newImage':newImage,
			'newAnim':newAnim,

			'checkIfTouched':checkIfTouched,
			'getContourRectangle':getContourRectangle,

			'getPetitCercle':getPetitCercle,
			'showContacts':showContacts,
		
			'bidon':null
		}
	}
)