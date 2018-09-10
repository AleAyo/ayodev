/**
 * @license
 * recordaudio.js - v0.1
 * Copyright (c) 2014, Alexandre Ayotte
 *
 * misc.js is licensed under the MIT License.
 * https://www.opensource.org/licenses/MIT
**/
// adapted from:
// https://github.com/mattdiamond/Recorderjs
//
define( 
	[ 'libayo/ayo','libayo/misc' ],
	function( AYO, MISC ) {
		var recordaudio = {
		}
		var actualAudioContext
		var volume
		var volumeLevel = 5
		
		var workerPath = app_paths.lib + '/monoRecorderWorker.js';
		console.log("RECAUDIO.workerPath = ", workerPath)
		var encMP3Path = app_paths.lib + '/mp3Worker.js';
		console.log("RECAUDIO.encMP3Path = ", encMP3Path)
		
		var recording = false


		recordaudio.ok = true
		recordaudio.error = null
		
		recordaudio.collectAudioHandler = null // function( {what:__, data:__} )

		function processUserMedia( ev ){
		    var data = ev.data;
			if (typeof recordaudio.collectAudioHandler == 'function') {
				//if (data.cmd) {
				//	data.what = data.cmd
				//	data.data = data.buf
				//}
				recordaudio.collectAudioHandler( data )
			}
			console.log( "worker sent this:", data );
		}


	    var worker, encoderWorker
		//
		// ---- API available ------
		// 
		recordaudio.isRecording = function() { return recording; }
	    recordaudio.record = function(){ if (this.ok) recording = true; else console.log("CAN'T RECORD?") }

	    recordaudio.stop = function(){ recording = false; }

	    recordaudio.clear = function(){
	      if (this.ok) worker.postMessage( { command: 'clear' } ); else console.log("CAN'T CLEAR?")
	    }
	    recordaudio.getBuffer = function() {
	      if (this.ok) worker.postMessage( { command: 'getBuffer' } ); else console.log("CAN'T GETBUFFER?")
	    }
	    recordaudio.exportWAV = function(){
	      //audiotype = audiotype || config.type || 'audio/wav';
	      if (this.ok) worker.postMessage( {
	        				command: 'exportWAV',
	        				type: 'audio/wav'
	      				} ); 
		  else 
			console.log("CAN'T EXPORT WAV?");
	    }
	    recordaudio.convertToMP3 = function( wavBlob ){
			var arrayBuffer;
			var fileReader = new FileReader();
			
			fileReader.onload = function() {
				arrayBuffer = this.result; //result of the FileReader!!!
				var data,buffer
				buffer = new Uint8Array(arrayBuffer)
				data = parseWav(buffer)

				console.log("recordaudio..Converting to Mp3");

				encoderWorker.onmessage = function( ev ) {
					if (ev.data.cmd == 'data') {
						console.log("recordaudio..Done converting to Mp3");
						var mp3Blob = new Blob( [new Uint8Array(ev.data.buf)], { type: 'audio/mp3' } );
						//
						var ev2 = {data : { what:'mp3', data: mp3Blob } }
						processUserMedia( ev2 )
					}
				}
				encoderWorker.postMessage({
					cmd: 'init',
					config: {
						mode: 3,
						channels: 1,
						samplerate: data.sampleRate,
						bitrate: data.bitsPerSample
					}
				})
				encoderWorker.postMessage({
					cmd: 'encode',
					buf: Uint8ArrayToFloat32Array(data.samples)
				})
				encoderWorker.postMessage({
					cmd: 'finish'
				})
			}

			fileReader.readAsArrayBuffer( wavBlob );
	    }


		function parseWav(wav) {
			function readInt(i, bytes) { //bénéficie du wav semi-global in scope.. :-/
				var ret = 0,
				shft = 0;

				while (bytes) {
					ret += wav[i] << shft;
					shft += 8;
					i++;
					bytes--;
				}
				return ret;
			}
			if (readInt(20, 2) != 1) throw 'Invalid compression code, not PCM';
			if (readInt(22, 2) != 1) throw 'Invalid number of channels, not 1';
			return {
				sampleRate: readInt(24, 4),
				bitsPerSample: readInt(34, 2),
				samples: wav.subarray(44)
			}
		}

	    function Uint8ArrayToFloat32Array(u8a) {
	      var f32Buffer = new Float32Array(u8a.length);
	      for (var i = 0; i < u8a.length; i++) {
	        var value = u8a[i << 1] + (u8a[(i << 1) + 1] << 8);
	        if (value >= 0x8000) value |= ~0x7FFF;
	        f32Buffer[i] = value / 0x8000;
	      }
	      return f32Buffer;
	    };

		

		function startUserMedia( stream ) {
			var source = actualAudioContext.createMediaStreamSource( stream );
			console.log('Media stream created.', source);

			//volume = actualAudioContext.createGain();
			//volume.gain.value = volumeLevel;
			//source.connect( volume );
			/////volume.connect( actualAudioContext.destination );

			console.log('Input connected to audio context destination.');

			recordaudio.context = source.context;// pour quel usage?
			recordaudio.node = source.context.createScriptProcessor( 2048, 1,1 ); // 4096, 2, 2 );

			encoderWorker = new Worker( encMP3Path );
			
			worker = new Worker( workerPath );
		    worker.onmessage = processUserMedia
		    worker.postMessage( {
		      	command: 'init',
		      	config: {
		        	sampleRate: recordaudio.context.sampleRate
		      	}
		    } );

			recordaudio.node.onaudioprocess = function( ev ){
				//onsole.log("getting audio data, ok?", recording, recordaudio.ok );
				if (!recording) return;
				if (!recordaudio.ok) return;
				//
				//onsole.log("getting audio data, keeping a copy of the stream (i.e. «recording»)")
				//
				worker.postMessage({
					command: 'record',
					buffer: //[
						ev.inputBuffer.getChannelData(0)
						//,
						//ev.inputBuffer.getChannelData(1)
					//]
				});
			}

			source.connect( recordaudio.node );
			//
			recordaudio.node.connect( recordaudio.context.destination );    //SEEMS TO BE, MR....this should not be necessary

			console.log('Recorder initialised.');
			
			//no need...recordaudio.ok = true
		}
		
		function reachTheUser( mess ) {
			var errorcallback = AYO.errorShowoffToTheUser
			if (errorcallback && (typeof errorcallback == "function")) {
				errorcallback( "ENTRÉE AUDIO", mess )
			}
		}

		recordaudio.init = function( functionToCollectAudioData ) {
			//
			this.collectAudioHandler = functionToCollectAudioData || null
			//
			recordaudio.ok = false
			var AudioContext
			try {
				// webkit shim
				AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
				//getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
				//window.URL = window.URL || window.webkitURL || window.mozURL;

				actualAudioContext = new AudioContext();
				
				console.log('Audio context set up.');
				
				//onsole.log('navigator.getUserMedia ' + (getUserMedia ? 'available.' : 'not present!'));
				//if (!getUserMedia) {
					//recordaudio.error = 'navigator.getUserMedia not present!'
					//recordaudio.ok = false
				//}
				//else 
				///////
				recordaudio.ok = true
			} 
			catch (err) {
				reachTheUser("Ce fureteur ne permet pas l'enregistrement audio.")
				console.warn('No web audio support in this browser!',err);
				recordaudio.error = 'No web audio support in this browser!'
				recordaudio.ok = false
			}

			// new way!
			if (recordaudio.ok) {
				navigator.mediaDevices.getUserMedia( { audio: true } )
				.then( 
					startUserMedia
				) 
				.catch( 
					function(err) {
						reachTheUser("L'enregistrement audio est impossible ou non autorisé")
						console.log('No live audio input: ', err);
						recordaudio.error = 'No live audio input...'
						recordaudio.ok = false
					} 
				)
			}
			return recordaudio.ok
		}
		
		// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
		//
		// Older browsers might not implement mediaDevices at all, so we set an empty object first
		if (navigator.mediaDevices === undefined) {
		  navigator.mediaDevices = {};
		}

		// Some browsers partially implement mediaDevices. We can't just assign an object
		// with getUserMedia as it would overwrite existing properties.
		// Here, we will just add the getUserMedia property if it's missing.
		if (navigator.mediaDevices.getUserMedia === undefined) {
		 	navigator.mediaDevices.getUserMedia = function( constraints ) {

		    	// First get ahold of the legacy getUserMedia, if present
		    	var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

		    	// Some browsers just don't implement it - return a rejected promise with an error
		    	// to keep a consistent interface
		    	if (!getUserMedia) {
					reachTheUser("Ce fureteur n'offre pas la possibilité d'un enregistrement audio.")
		      		return Promise.reject( new Error('getUserMedia is not implemented in this browser') );
		    	}

				console.log('This browser is using the OLD way : navigator.getUserMedia(a,b,c,d)');

		    	// Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
		    	return new Promise( function(resolve, reject) {
		      							getUserMedia.call(navigator, constraints, resolve, reject);
		    						}
								);
		  	}
		}
		
		window.URL = window.URL || window.webkitURL || window.mozURL;
		

		return recordaudio
	}
)