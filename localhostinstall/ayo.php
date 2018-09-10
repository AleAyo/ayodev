<?php
	//
	//ini_set('display_errors', 1);
	//error_reporting(E_ERROR | E_PARSE);

	include_once "__serv.php";
	if (!isset($WHERAYO)) {
		$HEREorTHERE = "./";
		$HEREorTHERElib = "./";
	}
	else {
		$HEREorTHERE = $WHERAYO;
		$HEREorTHERElib = $WHERTIERS;
	}
	
	include_once $HEREorTHERE."ayo.php";

?>