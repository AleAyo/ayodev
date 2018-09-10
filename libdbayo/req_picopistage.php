<?php
	//
	/**
	 * @license
	 * req_picopistage.php - v0.1
	 * Copyright (c) 2016, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/
	
	$usr_IP = $_SERVER['REMOTE_ADDR'];
	$usr_browser = $_SERVER['HTTP_USER_AGENT'];
	$picossage = $data;
				
	$dataReturned = array( "picopist" => true );
	$ok = 'ok';

	$myFile="picopiste/pistes.php";
	$fh = fopen($myFile, 'a'); // or die("can't open file");
	if ($fh) {

		$d = date("Y-m-d G:i:s");
		fwrite($fh, $d ."\t". $SESSYOID. "\t". $usr_IP ."\t". $usr_browser ."\t". $usr_id ."\t". $picossage ."\n");
		fclose($fh);

	}
?>