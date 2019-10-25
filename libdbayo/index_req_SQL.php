<?php
	//
	/**
	 * @license
	 * index_req_SQL.php - v0.1
	 * Copyright (c) 2014, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/
	
	$index_req_SQL = array(
		'getfile'=>		array( 'prefab'=>true, 'file'=>'req_fileread',  'level'=>1),
		'setfile'=>		array( 'prefab'=>true, 'file'=>'req_filewrite', 'level'=>1),
		
		'dbBLOB'=>		array( 'prefab'=>true, 'file'=>'req_dbBLOB',    'level'=>1),
		'dbtiny'=>		array( 'prefab'=>true, 'file'=>'req_dbtiny',    'level'=>0), //index_req_TABLES_levelmin
		'getlistof'=>	array( 'prefab'=>true, 'file'=>'req_getlistof', 'level'=>0), //index_req_TABLES_levelmin
		
		'sCRUD'=>	array( 'prefab'=>true, 'file'=>'req_tinyCRUD', 'level'=>0), //generated table/view defitionions (v2)

		'picopiste' =>  array( 'prefab'=>true, 'file'=>'req_picopistage', 'level'=>0),
		'PHPERR' =>  array( 'prefab'=>true, 'file'=>'req_mailerr', 'level'=>0),
		
		'bidon'=>		array('file'=>'?', 'level'=>999)
	);

?>