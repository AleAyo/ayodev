<?php
	//
	/**
	 * @license
	 * req_fileread.php - v0.1
	 * Copyright (c) 2014, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/
	include_once( svp_paths( "libdbayo/utils_req.php" ) );
	
	//
	$pth = str_replace( '../', '', $data['path'] );
	$pathexercices = "app/data/" . $pth; ////. '.php';
	
	//vertir( "req_filedata", $pathexercices );
				
	$dataReturned = array();
	$ok = 'ok';
	gimmeplainfile( $dataReturned, $pathexercices );

	if ($REQTRC) {
			arr_dumpU( $dataReturned, '   ' );
			print "\n";
	}


?>