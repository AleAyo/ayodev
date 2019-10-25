<script type='text/javascript'><!--
	//
	if (AYO) {
		var old_errorShowoffToTheUser = AYO.errorShowoffToTheUser;
		var errorreport_IGNORE = {
			receive: function( dataReceived ) {
				console.log( dataReceived );
			}
		}
		AYO.errorShowoffToTheUser = function( where, what ) {
			console.log("Trying to send an email (php error reporting)");
			var allreq = AYO.newXHR()
			allreq.add( errorreport_IGNORE, { act:"PHPERR",  data:{ 'what':what, 'where':where } } );
			allreq.send() //quietly
			
			//var formerr, formerrwhat, formerrwhere;
			//formerr = document.getElementById("ayodev_phperror_reporting");
			//formerrwhat = document.getElementById("ayodev_phperror_reporting_what");
			//formerrwhere = document.getElementById("ayodev_phperror_reporting_where");
			//if (formerr && formerrwhat && formerrwhere) {
			//	formerrwhat.value = what;
			//	formerrwhere.value = where;
			//	formerr.submit();
			//}
			
			console.log("Trying to show error to the user");
			
			if (old_errorShowoffToTheUser && (typeof old_errorShowoffToTheUser == "function")) {
				old_errorShowoffToTheUser( where, what );
			}
		}
	}
	else {
		console.log("AYO is not yet defined??");
	}
	
--></script>