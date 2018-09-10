/**
 * @license
 * vector.js - v0.1
 * Copyright (c) 2015, Alexandre Ayotte
 *
 * misc.js is licensed under the MIT License.
 * https://www.opensource.org/licenses/MIT
**/

define( 
	[ 'libayo/misc',   'lib/svgjs/svg' ],
	function( MISC, SVG ) {
		var vector = {}

		Math.PIdiv180 = Math.PI / 180.0
		Math.i180divPI = 180.0 / Math.PI
		Math.rad = function(degrees) { return degrees * Math.PIdiv180 }
		Math.deg = function(radians) { return radians * Math.i180divPI; }


		// http://bl.ocks.org/cartoda/7c81ac78d1bba1f4ba40
		var MAX_ZOOM_IN = 2.0;
		var MAX_ZOOM_OUT = 0.2;
		var zoomStep = 0.2;
		var actualZoom = 1.0;

		
		function please_frontOnDrag() {
			this.front()
		}

		function entreIciEtLabas( icix, iciy, labasx,labasy ) {
			var r
			var dx,dy
			//--
			dx = labasx - icix
			dy = labasy - iciy
			r = MISC.in360( Math.deg( Math.atan2(dy,dx) ) )
			//onsole.log("  r, dx,dy  =     ",r, dx,dy)
			//--
			var angledxdy = {}
			//
			angledxdy.angle = r
			angledxdy.dx = dx
			angledxdy.dy = dy
			//
			return angledxdy
		}
		
		vector.arrow = function( g, x,y, scale, styles ) {
			var arr, a,b,c
			g = g.group()
			g.move(x,y)
			arr = g.polygon('0,0')
			a = 7 * scale
			b = 10 * scale
			c = 3 * scale
			arr.plot([ [0,0], [b,-c], [a,0], [b,c] ]).fill("#000")
			if (styles) arr.attr( styles )
			return arr
		}
		
		function criss( b, vx,vy ) {
			b.cx += vx
			b.x  += vx
			b.x2 += vx
			b.cy += vy
			b.y  += vy
			b.y2 += vy
		}
		vector.reallyBBox = function( item ){
			var b = item.bbox();
			var vx,vy
			vx = item.x()
			vy = item.y()
			b.cx += vx
			b.x  += vx
			b.x2 += vx
			b.cy += vy
			b.y  += vy
			b.y2 += vy
			return b
		}
		vector.lineArrow = function( g, item1, item2, styles ) {
			var line, subg, arro
			//if (g.layerArrows) g = g.layerArrows
			subg = g.group()
			
			var b1x=null,b1y=null, b2x=null,b2y=null
			
			var b1 = item1.bbox();  criss( b1, item1.x(),item1.y() )
			var b2 = item2.bbox();  criss( b2, item2.x(),item2.y() )
			
			if (b2.x > b1.x2) {
				//la 2e bte loin dépassé la bte 1
				b1y = b1.cy
				b2y = b2.cy
				b2x = b2.x
				b1x = b1.x2
			}
			else if (b2.x2 < b1.x) {
				//inverse, la bte 2 loin derrière (avant) la bte 1
				b1y = b1.cy
				b2y = b2.cy
				b2x = b2.x2
				b1x = b1.x
			}
			else {
				b1x = b1.cx
				b2x = b2.cx
				if (b2.cy > b1.cy) {
					b2y = b2.y
					b1y = b1.y2
				}
				else {
					b2y = b2.y2
					b1y = b1.y
				}
			}
			//onsole.log( "box1 bounds:", b1, "  x,y: ",item1.x(),item1.y() )
			//onsole.log( "box2 bounds:", b2 )
			var adxy = entreIciEtLabas( b2x, b2y,  b1x, b1y )

			line = subg.line( b2x, b2y,  b1x, b1y ).stroke( { width: 2, color:"#f78" } )
			
			arro = this.arrow( subg,   b2x, b2y,   1, null )  // { fill:"#f78" }
			arro.transform({ rotation: adxy.angle, cx:0, cy:0 })

			
			if (styles) line.attr( styles )
			//
			return line
		}
		
		var doigtCouleurs = [ '#333', '#bbb',   '#f00', '#aa0', '#0f0', '#44f', '#b33',   '#4f4', '#f72', '#ff7', '#a4a', '#449' ]
		vector.quatreDoigts = function( g ){
			var main = []
			var d,tot
			tot = doigtCouleurs.length
			for(var i=0; i<tot; i++) {
				d = g.circle(80).fill( doigtCouleurs[i] ).opacity(0.35).move(-100,-100)
				main.push(d)
			}
			return main
		}
		
		vector.debogTag = function( g, txt, overwhat ) {
			var x,y
			x = overwhat.x() - 10
			y = overwhat.y() - 14
			var dt = g.text( txt ).attr({ 'font-size':'7.5px', fill:'#888' }).move( x, y )
		}
		vector.framedText = function( g, txt, x,y, styles ){
			var rr, vistxt,  subg
			//
			subg = g.group().move( x, y )
			//
			vistxt = subg.text( txt )//.move(0,0)
			//vistxt.attr({ 'alignment-baseline':"middle", 'text-anchor':"middle"} ) //x:"50%", y:"50%", 
			if (styles.textstyle) vistxt.attr( styles.textstyle )
			//
			var mx,my
			mx = styles.boxstyle.marginX || 12
			my = styles.boxstyle.marginY || 5
			
			var xywh = vistxt.bbox() //le move doit se faire aprsè le bbox() ???
			vistxt.move( 0, 0 )
			
			//var rad = 7
			rr = subg.rect( xywh.w+(2*mx), xywh.h+(2*my) ).move( -mx, -my )//.fill('#ffff55').radius(rad)
			
			var coinrond
			if (styles.boxstyle) rr.attr( styles.boxstyle )
			if (coinrond = styles.boxstyle.radius) rr.radius( coinrond )
			//
			//TROP COMPLIQUÉ... ESSAYER D'AJOUTER DANS code SVG pur... ?
			//rr.filter(function(add) {
			//  var blur = add.offset(0, 6).gaussianBlur(5)
			//  add.blend(add.source, blur)
			//})
			//
			vistxt.front()
			//
			//subg.bboxOnce = subg.bbox()
			//
			var axeSize
			if (axeSize = styles.boxstyle.wAxe) subg.circle(axeSize).move(0,0).fill('#f00')
			//
			return subg
		}
		

		vector.installDisplay = function( htmlID, pianoName ){
			var unDIV
			unDIV = document.getElementById( htmlID )
			
			var draw = SVG( unDIV ) //.size('100%', '100%')
			//debog
			//eventuellement, ce sera le whole kit (body) qui va nous relayer les events
			//draw.dblclick( 
			//	function(eventData) {
			//		console.log( "SVG.draw.dblclick()", eventData )
			//		//APPLIQUER LOCAL TRANSFORM???  group.center(eventData.x, eventData.y);
			//		if (eventData.shiftKey) zoomOut()
			//		else zoomIn();
			//	}
			//);
			var elem = draw.node //document.getElementById( "SvgjsSvg1001" )
			SHIMCL( elem )
			elem.setAttribute( "piano", pianoName )
			//elem.setAttribute( "param", "***" )
			//elem.classList.add("panCursor")
			
			//onsole.log( elem )
				
			//Group the background and the created objects to do the tranformations on all
			draw.tabladessin = draw.group(); //for panning
			draw.tabladessin.attr("id", "maTablaDessin")
			draw.papier = draw.tabladessin.group(); //for zooming
			draw.papier.attr("id", "monPapier")
			
			return draw
		}

		function zoomIn(){
			if(actualZoom < MAX_ZOOM_IN){
				actualZoom = roundFloat(parseFloat(actualZoom) + parseFloat(zoomStep));
				world.scale(actualZoom, actualZoom);
			}
		}		
		function zoomOut(){
			if(actualZoom > MAX_ZOOM_OUT){
				actualZoom = roundFloat(parseFloat(actualZoom) - parseFloat(zoomStep));
				world.scale(actualZoom, actualZoom);
			}
		}
		function roundFloat(value){
			return value.toFixed(2);
		}


		return vector
	}
)