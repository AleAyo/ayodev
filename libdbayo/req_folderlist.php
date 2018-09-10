<?php
	//
	/**
	 * @license
	 * req_folderlist.php - v0.1
	 * Copyright (c) 2014, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/
	include_once( svp_paths( "libdbayo/utils_req.php" ) );
	
	//
	$pathexercices = "app/data/" . $data['path'];
	
	//vertir( "req_folderlist", $pathexercices );
				
	//$dataReturned = gimmeallfiles( $subpath );
	$dataReturned = array();
	
	$lst = gimmeallfiles( $pathexercices );
	foreach($lst as $itm) {
		//if ($REQTRC) echo $itm."/\n";
		//vertir("     ", $itm );
		$subpath = $pathexercices."/".$itm;
		$sublst = gimmeallfiles( $subpath );
		$nbexer = 0;
		$rec = array();
		$rec[] = $itm;
		foreach($sublst as $subitm) {
			$rec[] = $subitm;
		}
		$dataReturned[] = $rec;
	}
	$ok = 'ok';

	if ($REQTRC) {
			arr_dumpU( $dataReturned, '   ' );
			print "\n";
	}


?>