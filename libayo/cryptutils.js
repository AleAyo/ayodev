/**
 * @license
 * cryptutils.js - v0.1.0
 * Copyright (c) 2017-2018, Alexandre Ayotte
 *
 * licensed under the MIT License.
 * http://www.opensource.org/licenses/MIT
 */

define( 
	function() {
		var cryptutils = {}

		//
		function bytes2str(bytes) {
			//goog.crypt.utf8ByteArrayToString
			var out = [], pos = 0, c = 0, tot = bytes.length;
			var c1,c2,c3,c4,u
			while (pos < tot) {
				c1 = bytes[pos++];
				if (c1 < 128) {
					out[c++] = String.fromCharCode(c1);
				} else if (c1 > 191 && c1 < 224) {
					c2 = bytes[pos++];
					out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
				} else if (c1 > 239 && c1 < 365) {
					// Surrogate Pair
					c2 = bytes[pos++];
					c3 = bytes[pos++];
					c4 = bytes[pos++];
					u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) -
					0x10000;
					out[c++] = String.fromCharCode(0xD800 + (u >> 10));
					out[c++] = String.fromCharCode(0xDC00 + (u & 1023));
				} else {
					c2 = bytes[pos++];
					c3 = bytes[pos++];
					out[c++] =
					String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
				}
			}
			return out.join('');
		};
		function str2bytes( str ) {
			var out = [], p = 0, tot=str.length ;
			var c, chcd = ''
			for (var i = 0; i < tot; i++) {
				c = str.charCodeAt(i);
				//chcd += " "+c+"("+str[i]+")";
				if (c < 128) {
					out[p++] = c;
				} else if (c < 2048) {
					out[p++] = (c >> 6) | 192;
					out[p++] = (c & 63) | 128;
				} else if (
						((c & 0xFC00) == 0xD800) && ((i + 1) < tot) &&
						((str.charCodeAt(i + 1) & 0xFC00) == 0xDC00)) {
							// Surrogate Pair
							c = 0x10000 + ((c & 0x03FF) << 10) + (str.charCodeAt(++i) & 0x03FF);
							out[p++] = (c >> 18) | 240;
							out[p++] = ((c >> 12) & 63) | 128;
							out[p++] = ((c >> 6) & 63) | 128;
							out[p++] = (c & 63) | 128;
				} else {
							out[p++] = (c >> 12) | 224;
							out[p++] = ((c >> 6) & 63) | 128;
							out[p++] = (c & 63) | 128;
				}
			}
			//onsole.log( chcd );
			return out;
		}
		

		function aa2str( r ) {
			var seg=8
			var lon = r.length
			var bytes,chunk
			var i,s,c,chars,suivant,number, j,subs,trois
			bytes = []
			s = ''
			for(i=0; i<lon; i+=seg) {
				subs = r.substr( i, seg )
				number = 0
				trois = subs.length
				for(j=0; j<trois; j++) {
					a = AYLPHA.indexOf( subs[j] )
					if (a<0) a = 0
					number = (32*number) + a
				}
				trois = number //juste pour traces
				chunk = []
				for(;;) {
					suivant = Math.floor( number / 256 )
					c = number - (suivant * 256)
					number = suivant
					chunk.unshift(c)
					if (number <= 0) break
				}
				bytes = bytes.concat( chunk )
				//onsole.log( subs, "--->", trois, "--->", chunk )
			}
			s = bytes2str(bytes)
			return s
		}
		
		
		function str2aa( s ) {
			//return s
			var seg = 5
			var bytes
			var lon,i,r,c,chars,suivant,number, j,subs,trois
			r = ''
			bytes = str2bytes(s)
			lon = bytes.length
			for(i=0; i<lon;i+=seg) {
				subs = bytes.slice( i, i+seg )
				trois = subs.length
				number = 0
				for(j=0; j<trois; j++) {
					number = (number*256) + subs[j]//.charCodeAt( 0 )
				}
				//onsole.log(i, subs , number )
				//number = s.charCodeAt( i )
				chars = '';
				for(;;) {
					suivant = Math.floor(number / 32);
					c = number - (suivant * 32);
					number = suivant;
					chars = AYLPHA.charAt( c ) + chars;
					if (number<=0) break;
				}
				r += chars
			}
			return r
		}
		
		cryptutils.str2aa = str2aa;
		cryptutils.aa2str = aa2str;

		cryptutils.str2bytes = str2bytes;
		cryptutils.bytes2str = bytes2str;

		return cryptutils
	}
)