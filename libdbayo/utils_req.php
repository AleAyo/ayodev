<?php
	//
	/**
	 * @license
	 * util_req.php - v0.1
	 * Copyright (c) 2014, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/
	//
	function arr_dump( $arr, $level='  ') {
		if (is_array($arr)) {
			print "\n";
			$keys = array_keys($arr);
			foreach( $keys as $ky ) {
				//if (!is_string($ky)) continue;
				$val = $arr[$ky];
				$ky = str_pad('['.$ky.']',20);
				print "$level $ky = |";
				arr_dump($val, $level.$level);
				print "|\n";
			}
			print "    ....";
		}
		else print $arr;
	}
	
	function gimmeplainfile( &$record, $fichier ) {
		$dataread = file_get_contents( $fichier );
		if ($dataread === false) {
			$record['error'] = 'probleme lecture fichier '.$fichier;
		}
		else {
			$lst = preg_split("/\R/", $dataread);
			//BAD for CRLF, LF, CR ...  
			//  $lst = explode("\n", $dataread);
			foreach($lst as $itm) {
				$itm = trim($itm);
				//
				if (!(strpos($itm, "<?" ) === false)) continue;

				$record[] = $itm;
			}
		}
	}
	
	function gimmetherecord( &$record, $fichier, $stopAtSection=null ) {
		$earlyStop = ($stopAtSection!=null);
		if ($earlyStop) $stopAtSection = "----".$stopAtSection;
		//$record = array();
		$dataread = file_get_contents( $fichier );
		if ($dataread === false) {
			$record['error'] = 'probleme lecture fichier '.$fichier;
		}
		else {
			$lst = explode("\n", $dataread);
			foreach($lst as $itm) {
				$itm = trim($itm);
				if ($earlyStop && ((!(strpos($itm, $stopAtSection) === false)))) break;
				//
				if (!(strpos($itm, "<?" ) === false)) continue;
				if (!(strpos($itm, "//") === false)) continue; //conséquence: pas de // dans le record user
				if (strlen($itm)>0) {
					$parts = explode(":", $itm);
					for( ; count($parts) < 2; $parts[]='');
					$record[ trim($parts[0]) ] = trim($parts[1]);
				}
			}
		}
		//return $record;
	}
	function gimmeallfiles( $path ) {
		global $REQTRC;
		$lst = array();
		$all = scandir( $path );
		//$d = dir( $path );
		//if ($d == null) {
		if ($all === false) {
			if ($REQTRC) echo "ERROR gimmeallfiles( $path )\n";
			return $lst;
		}
		//$inorderplease = 
		//while (false !== ($entry = $d->read())) {
		//	if (substr($entry,0,1)=='.') continue;
		//	$lst[] = $entry;
		//}
		//$d->close();
		foreach( $all as $entry ) {
			if (substr($entry,0,1)=='.') continue;
			$lst[] = $entry;
		}
		return $lst;
	}
	


?>