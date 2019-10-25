<?php
	//
	/**
	 * @license
	 * req_login.php - v0.1
	 * Copyright (c) 2014, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/

	$NOW = date("Y-m-d G:i:s");
	print2log( "req_mailerr!!",   $NOW );
	
	$dataReturned = array();
	
	$what = $data['what'];
	$where = $data['where'];
	
	if (isset($what)) {
		
	    $entete = "From: mailerr@cyberlude.ca\n\r";
		$cnt = "::::::::::::::::::::\n";
	    $cnt .= "PHPERROR : ".$what;
	    $cnt .= "\n::::::::::::::::\n";
	    $cnt .= "SERVER['HTTP_USER_AGENT']: ".$_SERVER['HTTP_USER_AGENT']."\n";
	    $cnt .= "SERVER['REMOTE_ADDR']:     ".$_SERVER['REMOTE_ADDR']."\n";

	    $e = @mail( 'aa@cyberlude.com', 'PHP ERR REPORT ['.$where.']', $cnt, $entete );		
		print2log( "req_mailerr... mailed($e)", $what );
		
	}
	else {
		$dataReturned['error'] = $m = "data[what] is not defined";
		print2log( "req_mailerr...ERROR?? ", $m );
	}
	
	//pour voir mieux traces dans le temps...
	$dataReturned['timestamp'] = $NOW;
	$dataReturned['ok'] = $ok = true;


?>