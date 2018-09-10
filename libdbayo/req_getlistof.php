<?php
	//
	/**
	 * @license
	 * req_getlistof.php - v0.1
	 * Copyright (c) 2014, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/
	ini_set('display_errors', 1);
	error_reporting(E_ERROR | E_PARSE);

	include_once( svp_paths("libdbayo/def.php") );
	include_once( svp_paths("libdbayo/def_db.php") );

	avertir( "req_getlistof", 'table_name.......', $data['table_name'] );
	avertir( "req_getlistof", 'column_name......', $data['column_name'] );
	avertir( "req_getlistof", 'where_clause.....', $data['where_clause'] );
	avertir( "req_getlistof", 'order_by.........',$data['order_by'] );
	
	$table_name = $data['table_name'];
	$column_name = $data['column_name'];
	$where_clause = $data['where_clause']; if (!$where_clause) $where_clause = "true";
	$order_by = $data['order_by']; if (!$order_by) $order_by = '';
	
	//new 30 mai 2017
	$extraSelect = $data['extraSelect']; if ($extraSelect) $extraSelect = ", $extraSelect";
	$extraCols = $data['extraCols'];  if ($extraCols) $extraCols = ", $extraCols";
	
	if ("$where_clause" == 'level') {
		$where_clause = "(level <= $usr_level)";
	}
	
	$BADLEVEL = false;
	if (isset($index_req_TABLES_levelmin)) {
		$table_level = $index_req_TABLES_levelmin[ $table_name ];
		if (is_array($table_level)) {
			$table_level = $table_level[ "list" ];
		}
		if ($table_level === null) $BADLEVEL = true;
		else $BADLEVEL = (($table_level*1) > ($usr_level*1));
	}

	if ($BADLEVEL) {
		$dataReturned = array();
		$dataReturned['ok'] = false;
		$dataReturned['error'] = "Pas les autorisations suffisantes";
		avertir( "SECURITY req_getlistof", 'BADLEVEL', "usr_level:$urs_level VS table_level:$table_level".
			'sql'.$data['sql'].
			',table_name'.$data['table_name'].
			',where_clause'.$data['where_clause'].
			',order_by '.$data['order_by'], 
		true ); //email!!
	}
	else {
		//ffunction db_select_simplier(  &$loadedData, $fieldsToReturnAsRecordList, $completeClausePlease )
		$dataReturned = array();
		$listD = array();

		//vertir( "req_getlistof------------", $column_name.$extraCols );
		//vertir( "req_getlistof------------", $column_name.$extraSelect );
		$wentWell = db_select_simplier( $listD,
			// list retournée de variable-name
			$column_name.$extraCols , 
			// requete complète!
			"SELECT $column_name$extraSelect FROM $table_name WHERE ".
			$where_clause.' '.
			$order_by
		);

		//---<WARNING>
		//---patch à améliorer: i.e. ajouter une valeurs envoyée
		if (strpos( $column_name, 'mtpss') !== false) {
			//oups, on doit decrypter
			//vertir("req_getlistof MTPSS:", $column_name );
			$kys = explode( ',', $column_name );
			$ki = -1;
			foreach( $kys as $k ) {
				$ki += 1;
				//vertir("req_getlistof ------:", $ki, $k );
				if (trim($k) == 'mtpss') break;
			}
			$tot = count($listD);
			if ($ki < count($kys)) for( $i=0; $i<$tot; $i++ ) {
				$plain = uncryptaa( $listD[$i][$ki] );
				//vertir("req_getlistof ......:", $listD[$i][$ki], $plain );
				$listD[$i][$ki] = $plain;
			}
			//vertir("req_getlistof MTPSS:", 'col('.$ki.')'. "QTY:".$tot );
		}

		//$dataReturned['table_name'] = $table_name;
		$dataReturned['records'] = $listD;

		//
		avertir("req_getlistof SQL:", '('.$ok.')', "QTY:".count($dataReturned) );
	}
	
	
	
	$dataReturned['what_was_done'] = array(
		'sql' =>          'loadMany',
		'table_name' =>   $table_name,
		'record_id' =>    $where_clause, // ??? a bit weird maybe ?
		'column_name' =>  $column_name,
		'column_value' =>  count($listD)
	);
	
	
	if ($wentWell) {
		$ok = 'ok';
		$error = '';
	}
	else {
		$ok = 'error';
		global $SQLERROR;
		$error = $SQLERROR;
	}

?>