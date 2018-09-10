<?php
	//
	/**
	 * @license
	 * uniqID.php - v0.1
	 * Copyright (c) 2014, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/

	ini_set('display_errors', 1);
	error_reporting(E_ERROR | E_PARSE);
	
	function AA_convert32( $number ) {
		$AAPLHA = "A23456789BCDEFGHJKLMNPQRSTUVWXYZ";
		$chars = '';
		for(;;) {
			$suivant = floor($number / 32);
			$c = $number - ($suivant * 32);
			$number = $suivant;
			$chars = $AAPLHA[ $c ] . $chars;
			if ($number<=0) break;
		}
		return $chars;
	}
	
	function pAA_base32plusFill( $number, $wide ) {
		$wide += 0;
		$n32 = "AAAAAAAAAA".AA_convert32( $number );
		return substr( $n32, -$wide );
	}

	$UNIQCOUNTER = rand(4,13);
	function puniqueIDgeneratorfunction( $twoletter, $withhaz ) {
		global $UNIQCOUNTER;
		$micro = microtime(true);
		$timepourdate = floor($micro);
		$msec = round(($micro - $timepourdate)*1000);
		//$millisec = $timepourdate.$msec;

		$d = getdate($timepourdate);

		$hms = ($d['hours']*60*60) + ($d['minutes'] * 60) + ($d['seconds']);
		$yr = $d['year'] - 2014;
		$mt = $d['mon'];
		$dy = $d['mday'];

		$ts = $twoletter;

		$ts .= pAA_base32plusFill( $yr, 2 ); //2014 + 32*32 = 2014+1024 = 3038!!!
		$ts .= pAA_base32plusFill( $mt, 1 );
		$ts .= pAA_base32plusFill( $dy, 1 );
		$ts .= pAA_base32plusFill( $hms, 4 );
		//
		$ts .= pAA_base32plusFill( $msec, 3 );
		if ($withhaz !== false) {
			$ts .= pAA_base32plusFill( rand(1000,32767), 2 );
		}
		else {
			$ts .= pAA_base32plusFill( $UNIQCOUNTER, 2 );
			$UNIQCOUNTER += 17;
		}
		
		return $ts;
	}	

?>