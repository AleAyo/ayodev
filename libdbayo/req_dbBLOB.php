<?php
	//
	/**
	 * @license
	 * req_dbBLOB.php - v0.1
	 * Copyright (c) 2016, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/
	ini_set('display_errors', 1);
	error_reporting(E_ERROR | E_PARSE);

	//vertir( "req_dbBLOB ------------", '','');
	
	//vertir( "req_dbtiny-------a----", '','');
	include_once( svp_paths("libdbayo/def.php") );
	
	//vertir( "req_dbtiny-------b----", '','');
	include_once( svp_paths("libdbayo/def_db.php") );

	$sql = $data['sql'];
	$table_name = $data['table_name'];
	$record_id = $data['record_id'];
	$column_name = $data['column_name'];
	
	//vertir( "req_dbBLOB -----SIZE---", '',strlen($column_value));
	
	$p = 'app/blobs/'.$record_id.'.blob';
		
		db_connect();

		//--verifier si le id existe----
		$q = "SELECT id FROM $table_name WHERE id = `$record_id`";
		
		$r = db_query( $q ); if ($r && ($DETAIL = db_fetch_assoc($r))) $qty=1; else $qty=0;
		
		if ($qty<1) {
			$dataReturned = array( "ok"=> false, "qty"=> 0, "error"=> "ID inexistant", "query"=> $q );
		}
		else if ($sql == 'write') {
			$column_value = 'SVPLOAD';
	
			$filedata = $data['column_value'];
			
			$fh = fopen($p, 'w'); // or die("can't open file");
			if ($fh) {
				fwrite( $fh, $filedata );
				fclose( $fh );

				$q  = "UPDATE $table_name SET $column_name=`$column_value` WHERE id=`$record_id`";

				//--on change la base de données-------------
				$res = db_query( $q );
				if ($res) {
					$qty = db_affected_rows();
					$dataReturned = array( "ok"=> true, "qty"=> $qty, "p"=> $p );
				}
				else {
					$dataReturned = array( "ok"=> false, "qty"=> 0, "error"=> db_error() );
				}
			}
			else {
				$dataReturned = array( "ok"=> false, "qty"=> 0, "error"=> "can't write to [$p]" );
			}
		
		}
		else if ($sql == 'read') {
			$column_value = file_get_contents( $p );
			if ($column_value === false) {
				$dataReturned = array( "ok"=> false, "qty"=> 0, 'record_id' => $record_id,   'column_value' =>  $column_value,  "error"=> "can't read from [$p]" );
				$column_value = '';
			}
			else {
				$dataReturned = array( "ok"=> true, "p"=> $p,  'record_id' => $record_id,   'column_value' =>  $column_value );
			}
		}
	
				
	//
	avertir("req_dbBLOB SQL:($sql)", 'ok='.$dataReturned['ok'].'  qty='.$dataReturned['qty'], 'err=('.$dataReturned['error'].')' );
	
	//compliqué pour rien? pourquoi pas dans dataReturned[] tout simplement?...
	//$dataReturned['what_was_done'] = array(
	//	'sql' =>          $sql,
	//	'table_name' =>   $table_name,
	//	'record_id' =>    $record_id,
	//	'column_name' =>  $column_name
	//);
	
	
	$wentWell = $dataReturned['ok'];
	if ($wentWell) {
		$ok = 'ok';
		$error = '';
	}
	else {
		$ok = 'error';
		//global $SQLERROR;
		$error = $SQLERROR;
	}


?>