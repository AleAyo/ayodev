<?php
/**
 * @license
 * ayo_gate.php - v0.1.0
 * Copyright (c) 2016, Alexandre Ayotte
 *
 * code is licensed under the MIT License.
 * http://www.opensource.org/licenses/MIT
 */
	//
	$SESSYObyGATE = 0;

	$SESSYOID = $_POST['SESSYOID'];
	$SESSYOINFO = array();

	//print2log( "FORM THE GATE !!: ", $SESSYOID );

	if ($SESSYOID && readSESSYO( $SESSYOID, $SESSYOINFO )) {
		
		$timedoubt = $SESSYOINFO['timeofdoubt'];
		$now = time();
		$timeBeforeLoosingTrust = max( 0, ($timedoubt+0) - $now );
		
		//
		//print2log( "FORM THE GATE ?: ", $SESSYOID, $timedoubt );

		if ( $timeBeforeLoosingTrust > 0 ) {
			//ok on continue
			//
			//print2log( "FORM THE GATE --> OK WE PASS: ", $SESSYOID, $timeBeforeLoosingTrust, $SESSYOINFO['usr_id'] );
			$AYLPHA = $SESSYOINFO['aylpha'];
			$SESSYObyGATE = $SESSYOID;
		}
		else {
			//print2log( "FORM THE GATE -- dislogin!: ", $SESSYOID );
			disloginSESSYO( $SESSYOID, $SESSYOINFO );
		}
	}
	
	
?>