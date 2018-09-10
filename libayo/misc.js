/**
 * @license
 * misc.js - v0.1
 * Copyright (c) 2014, Alexandre Ayotte
 *
 * misc.js is licensed under the MIT License.
 * https://www.opensource.org/licenses/MIT


function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

**/

define( 
	function() {

		function hazR(a,b) { if (b==null) {b=a;a=0;} return  a + (Math.random() * (b-a))  }
		function haz(a,b) { if (b==null) {b=a;a=0;} 
			return Math.round( a + (Math.random() * (b-a)) ) 
		  //return a + Math.floor(Math.random() * Math.floor(b-a));
		}

		function tipeuacote( a, b ) {
			//a & b > 0
			var sign = 1 - (2 * haz(0,1))
			return sign * haz(a,b)
		}
		function in360(r) {
			if (r >= 360)  
				return in360( r - 360 ) 
			else if (r <= -360)  
				return in360( r + 360 )
			
			return r
		}
		function rotCourte(r) {
			if (r >  180) return r-360 
			if (r < -180) return r+360
			return r 
		}


		function nu( v ) {
			if (v==undefined) return "";
			if (v==null) return "";
			return v;
		}
		function foreach( obj, func ) {
		    for (var k in obj) {
		        if (!obj.hasOwnProperty(k)) continue;
				if (func( k, obj[k] )===false) { return; }
		    }
		}
	
		function count_words( chaine ) {
			var exp=new RegExp("[a-zA-Z0-9éèêëàáâäóòôöíìîïûùçÉÈÊËÀÁÂÄÒÓÔÖÌÍÎÏÛÙÇ]+","g");
			var liste=chaine.match(exp);
			if (liste==null) return 0;
			return liste.length;
		}
		// pas correct dans tous les cas, voir Object.keys()
		function array_keys( obj ) {
		    var r = []
		    for (var k in obj) {
		        if (!obj.hasOwnProperty(k)) 
		            continue
		        r.push(k)
		    }
		    return r
		}
		function rgb2int( R,G,B )    { 
			//return toHex(R)+toHex(G)+toHex(B);
			return ( (R*256) + G )*256 + B
		}
		function rgba2hex( R,G,B,A ) { 
			if (A==null) return toHex(R)+toHex(G)+toHex(B)
			return toHex(R)+toHex(G)+toHex(B)+toHex(A); 
		}
		var hex0F = "0123456789ABCDEF"
		function toHex(n) {
			n = parseInt(n,10);
			if (isNaN(n)) return "00";
			n = Math.max(0,Math.min(n,255));
			return hex0F.charAt((n-n%16)/16) + hex0F.charAt(n%16);
		}
		function cutHex(h) { return (h.charAt(0)=="#") ? h.substring(1,7) : h }
		function hex2rgb(h) { 
			h = cutHex(h)
			return { 
				r:parseInt(h.substring(0,2),16),
				g:parseInt(h.substring(2,4),16),
				b:parseInt(h.substring(4,6),16)
			}
		}
		function remplirDeZerosComme(a) {
			var i,tot,b
			b = []
			tot = a.length
			for(i=0;i<tot;i++) {
				b.push(0)
			}
			return b
		}
		
		
		return {
			'haz':haz,
			'hazR':hazR,
			'tipeuacote':tipeuacote,
			
			'rgb':rgb2int,
			'hex2rgb':hex2rgb,
			'remplirDeZerosComme':remplirDeZerosComme,

			'in360':in360,
			'rotCourte':rotCourte,
			
			'nu':nu,
			'foreach':foreach,
			
			'count_words':count_words,
			'array_keys':array_keys
			
		}
	}
)