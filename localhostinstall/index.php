<?php

	include_once "__serv.php";
	if (!isset($WHERAYO)) {
		$HEREorTHERE = "./";
		$HEREorTHERElib = "./";
	}
	else {
		$HEREorTHERE = $WHERAYO;
		$HEREorTHERElib = $WHERTIERS;
	}
	
	$f = include $HEREorTHERE."index.php";
	if ( $f === false ) print $HEREorTHERE."ERROR INDEX.PHP";
	
?>