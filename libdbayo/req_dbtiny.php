<?php
	//
	/**
	 * @license
	 * req_dbtiny.php - v0.1
	 * Copyright (c) 2014, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/
	//vertir( "req_dbtiny------------", '','');
	ini_set('display_errors', 1);
	error_reporting(E_ERROR | E_PARSE);

	//vertir( "req_dbtiny-------a----", '','');
	include_once( svp_paths("libdbayo/def.php") );
	
	//vertir( "req_dbtiny-------b----", '','');
	include_once( svp_paths("libdbayo/def_db.php") );

	///
	/*
	//vertir( "req_dbtiny", 'sql',$data['sql'] );
	//vertir( "req_dbtiny", 'table_name',$data['table_name'] );
	//vertir( "req_dbtiny", 'record_id',$data['record_id'] );
	//vertir( "req_dbtiny", 'column_name',$data['column_name'] );
	//vertir( "req_dbtiny", 'column_value',$data['column_value'] );
	*/
	
	
	
	$sql = $data['sql'];
	$table_name = $data['table_name']; // sanitrimize()
	$record_id = $data['record_id'];
	$column_name = $data['column_name'];
	$column_value = $data['column_value'];

	
	$BADLEVEL = false;
	if (isset($index_req_TABLES_levelmin)) {
		$table_level = $index_req_TABLES_levelmin[ $table_name ];
		if (is_array($table_level)) {
			$table_level = $table_level[ $sql ];
		}
		if ($table_level === null) $BADLEVEL = true;
		else $BADLEVEL = (($table_level*1) > ($usr_level*1));
	}
	//vertir( "req_dbtiny", "usr_level=[$usr_level]" );
	//vertir( "req_dbtiny", "table_level=[$table_level]" );

	if ($BADLEVEL) {
		$dataReturned = array();
		$dataReturned['ok'] = false;
		$dataReturned['error'] = "Pas les autorisations suffisantes";
		avertEtMAIL( "SECURITY req_dbtiny", 'BADLEVEL', "usr_level:($usr_level) VS table_level:($table_level)\n".
			'sql=('.$data['sql'].
			'), table_name=('.$data['table_name'].
			'), record_id=('.$data['record_id'].
			'), column_name=('.$data['column_name'].
			'), column_value=('.$data['column_value'].')', 
		true ); //email!!
	}
	else {
		//---<WARNING>
		//---patch à améliorer: i.e. ajouter une valeurs envoyée
		if ($column_name == "mtpss") {
			$column_value = cryptaa( $column_value );
		}

		$record = array();

		if (is_array( $column_name )) {
			$tot = count( $column_name );
			for($i=0; $i<$tot; $i++) {
				$k = $column_name[$i];
				$v = $column_value[$i];
				if ($v=='null') $v='NULL'; //protection incomplete... un champs FLOAT peut recevoir '' et ça donne 0 en SQL et non NULL comme on veut
				$record[$k] = $v;
			}
		}
		else {
			if ($column_name) {
				$v = $column_value;
				if ($v=='null') $v='NULL';  //<WARNING> voir ci-dessus ! ! ! ! !
				$record[ $column_name ] = $v;
			}
		}

		if ($sql=="creates") {
			$record['id'] = $record_id;
			// db_new(              $tbl,       $keys_vals,   $someID,         $dontEscapeThoseValues, $dontDoIt_returnQuery ) {
			$dataReturned = db_new( $table_name, $record, $record_id );
		}
		elseif ($sql=='modifs') {
			// db_update(              $tbl,      $keys_vals,   $someID,        $dontEscapeThoseValues )
			$dataReturned = db_update( $table_name, $record, $record_id );
		}
		elseif ($sql=='deletes') {
			//db_delete(                 $tbl,        $someID,         $dontEscapeThoseValues, $specialWhereClause=null )
			$dataReturned = db_delete( $table_name, $record_id );
		}

		//
		avertir("req_dbtiny SQL:($sql)", 'ok='.$dataReturned['ok'].'  qty='.$dataReturned['qty'], 'err=('.$dataReturned['error'].') query='.$dataReturned['query'] );
		
	}
	

	//compliqué pour rien? pourquoi pas dans dataReturned[] tout simplement?...
	$dataReturned['what_was_done'] = array(
		'sql' =>          $sql,
		'table_name' =>   $table_name,
		'record_id' =>    $record_id,
		'column_name' =>  $column_name,
		'column_value' =>  $column_value
	);
	
	
	$wentWell = $dataReturned['ok'];
	if ($wentWell) {
		$ok = 'ok';
		$error = '';
	}
	else {
		$ok = 'error';
		global $SQLERROR;
		$error = $SQLERROR;
	}

	//if ($REQTRC) {
	//		arr_dump( $dataReturned, '   ' );
	//		print "\n";
	//}

?>