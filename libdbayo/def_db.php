<?php
	//
	/**
	 * @license
	 * def_db.php - v0.1
	 * Copyright (c) 2012, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/

	function keys_of_array( $kys_vals ) {
		$keys = array();
		foreach( $kys_vals as $ky => $val ) {
			if (is_string($ky)) {
				$keys[] = $ky;
			}
		}
		return $keys;
	}
	function keys2list( $arr ) {
		$o=''; $sp=''; 
		foreach ($arr as $em) { $o .= $sp . $em; $sp=', ';}
		return $o;
	}
	

	ini_set('display_errors', 1);
	error_reporting(E_ERROR | E_PARSE);

	/*-----------------------------------------------------------------------------------
	--  recoivent   un array("nom"="valeur", ...)
	--  retournent  un array( true/false, combien changé/0, erreur OU requete faite, rollback-requete )
	--
	*/

	function db_update( $tbl, $keys_vals, $someID, $dontEscapeThoseValues=null, $specialWhereClause=null ) {
		global $DB_LNK;
		//INUTILE(2018-07-12juill)--if (!$dontEscapeThoseValues) $dontEscapeThoseValues = array();
		//
		// check if the moron send us NOTHING!
		if ((is_array($keys_vals)===false) || (count($keys_vals)<1)) {
			return array( "ok"=> false, "qty"=> 0, "error"=> "No fields to save!!", "query"=> "NONE" );
		}
		//
		db_connect();
		$keys = keys_of_array( $keys_vals );
		
		//--verifier si le id existe----
		$kl = keys2list($keys);
		if (!$specialWhereClause) $specialWhereClause = "id=`$someID`";
		$q = "SELECT $kl FROM $tbl WHERE $specialWhereClause";///// id = `$someID`";
		$r = db_query( $q ); if ($r && ($DETAIL = mysqli_fetch_array( $r, MYSQLI_ASSOC ))) $qty=1; else $qty=0;
		//--existe?
		if ($qty<1) {
			return array( "ok"=> false, "qty"=> 0, "error"=> "ID inexistant", "query"=> $q );
		}
		//--ca nous a permit de prendre copie des valeurs existantes----
		return db_update_plain( $tbl, $keys, $keys_vals, $someID, $dontEscapeThoseValues, $DETAIL, $specialWhereClause );
	}
	function db_update_plain( $tbl, $keys, $keys_vals, $someID, $dontEscapeThoseValues=null, $old_vals=null, $specialWhereClause=null ) {
		global $DB_LNK;
		global $trackEachQueryIntoLogFile;
		//
		$sep = '';
		if ($old_vals!=null) {$rb = "UPDATE $tbl SET ";} else {$rb='## old_vals PAS SPÉCIFIÉ';} //--rollback request
		$q  = "UPDATE $tbl SET ";
	
		foreach( $keys as $ky ) {
			//printerr($ky." =>|".$new."|");
			//patch pour les dates null
			if ((strpos($ky, 'jourhre') !== false) && ($new=='')) $new = 'NULL';
			//
			$dontEscapeThis = ($dontEscapeThoseValues && in_array($ky,$dontEscapeThoseValues));
			if ($dontEscapeThis) $new = $keys_vals[$ky];
			else $new = str_replace( "`", "", $keys_vals[$ky] ); //on enlève notre esc-char, qui devrait ne pas être utilisé de toute façon
			//
			$esc = (($new=='NULL') || ($new=='NOW()') || ($dontEscapeThis)) ? "" : "`";
			$q  .= $sep. $ky."=".$esc.$new.$esc;
			
			if ($old_vals!=null) {
				$old = $old_vals[$ky];
				$esc = (($old=='NULL') || ($dontEscapeThis)) ? "" : "`";
				$rb .= $sep. $ky."=".$esc.$old.$esc;
			}
			$sep = ', ';
		}
		if (!$specialWhereClause) $specialWhereClause = "id=`$someID`";
		if ($old_vals!=null) $rb .= " WHERE $specialWhereClause"; 
		//BEN NON!! NO LIMIT
		//<sauf que>  D A N G E R
		//----limit 1 : juste un failsafe peu probable, un id doit être unique...
		$q  .= " WHERE $specialWhereClause";

		//--on change la base de données-------------
		//$trackEachQueryIntoLogFile = 1;
		$res = db_query( $q );
		if ($res) {
			$qty = db_affected_rows();
			return array( "ok"=> true, "qty"=> $qty, "query"=> $q, "rollback"=> $rb );
		}
		return array( "ok"=> false, "qty"=> 0, "error"=> db_error(), "query"=> $q );
	}


	// <QUESTION> est-ce que le id doit aussi être dans la liste des keys?
	// dans les autres appels on assume le nom "id" donc on pourrait ne pas l'obliger en plus dans la liste
	// + est-ce qu'on le connait puisque c'est NEW ????
	// OK! 
	// 1) oui il faut le fournir (l'inventer ailleurs)  
	// et 2) pas besoin de le fournir dans le rec, mais on force la valeur fournie

	function db_new( $tbl, $keys_vals, $someID, $dontEscapeThoseValues=null, $dontDoIt_returnQuery=false ) {
		global $DB_LNK;
		if (!$someID) return array( "ok"=> false, "qty"=> 0, "error"=> "ID is empty", "query"=> "ID is null/false/empty" );
		//
		// check if the moron send us NOTHING!
		if ((is_array($keys_vals)===false)) {
			return array( "ok"=> false, "qty"=> 0, "error"=> "No fields to save!!", "query"=> "keys_vals is not array" );
		}
		$keys_vals['id'] = $someID; 
		//---->> double protection: 
		//    1) on force que id fasse partie du record (si il ne faisait pas partie du record fournit)
		//    2) on force la valeur someID, celle dont on s'est assuré de l'inexistance, 
		//       et si on avait un autre valeur d'id dans le record, on l'écrase!
		//
		db_connect();
		$keys = keys_of_array( $keys_vals );
		//--verifier si le id n'existe pas----
		//PAS BESOIN ICI :  $kl = keys2list($keys);
		$q = "SELECT id FROM $tbl WHERE id = `$someID`";
		$r = db_query( $q ); if ($r && ($DETAIL = mysqli_fetch_array( $r, MYSQLI_NUM ))) $qty=1; else $qty=0; // NUM ou ASSOC ? DETAIL inutilisé anyway!
		//--existe?
		if ($qty>0) {
			return array( "ok"=> false, "qty"=> 0, "error"=> "ID existant", "query"=> $q );
		}
		
		//--on est certain (pendant qq millisec) qu'il est inexistant
		return db_new_intern( $tbl, $keys, $keys_vals, $someID, $dontEscapeThoseValues, false, $dontDoIt_returnQuery );
	}
	function db_new_intern( $tbl, $keys, $keys_vals, $someID, $dontEscapeThoseValues=null, $specialWhereClause=false, $dontDoIt_returnQuery=false ) {
		global $trackEachQueryIntoLogFile;
		$sep = '';
		if (!$dontEscapeThoseValues) $dontEscapeThoseValues = array();
		//
		if (!$specialWhereClause) $specialWhereClause = "id=`$someID`";
		$rb = "DELETE FROM $tbl WHERE $specialWhereClause";  //--rollback request complete 
		$q1 = '';
		$q2 = '';
	
		foreach( $keys as $ky ) {
			$new = str_replace( "`", "", $keys_vals[$ky] ); //on enlève notre esc-char, qui devrait ne pas être utilisé de toute façon
			//printerr($ky." =>|".$new."|");
			//patch pour les dates null
			if ((strpos($ky, 'jourhre') !== false) && ($new=='')) $new = 'NULL';
			//
			$esc = (($new=='NULL') || ($new=='NOW()') || in_array($ky,$dontEscapeThoseValues)) ? "" : "`";
			$q1  .= $sep.$ky;
			$q2  .= $sep.$esc.$new.$esc;
			$sep = ', ';
		}
		$q = "INSERT INTO $tbl ($q1) VALUES ($q2)";

		//for debog of batch doing
		if ($dontDoIt_returnQuery) return array( "query"=> db_query_prepOnly($q), "rollback"=> $rb );
		
		//--on change la base de données-------------
		//$trackEachQueryIntoLogFile = 1;
		$res = db_query( $q );
		if ($res) {
			$qty = db_affected_rows();
			return array( "ok"=> true, "qty"=> $qty, "query"=> $q, "rollback"=> $rb );
		}
		return array( "ok"=> false, "qty"=> 0, "error"=> db_error(), "query"=> $q );
	}


	function db_delete( $tbl, $someID, $dontEscapeThoseValues=null, $specialWhereClause=null ) {
		global $DB_LNK;
		if (!$dontEscapeThoseValues) $dontEscapeThoseValues = array(); //ici aussi!... pour le ROLLBACK!!   ATTENTION: pas de db_delete_intern() !!
		if (!$specialWhereClause) $specialWhereClause = "id=`$someID`";
		db_connect();
		//--verifier si le id existe----
		$kl = "*";
		$q = "SELECT $kl FROM $tbl WHERE $specialWhereClause";
		
		//====PROBLEM!!! on assume qu'on efface qu'un seul record à la fois, donc que le rollback insere UN SEUl RECORD
		//    idealement, generer une BATCH de INSERT pour chaque dataReturnedat retourné ci-dessous
		//    !!!!!!!!!!
		//
		//$trackEachQueryIntoLogFile = 1;
		$r = db_query( $q ); if ($r && ($DETAIL = mysqli_fetch_array( $r, MYSQLI_ASSOC ))) $qty=1; else $qty=0;
		//--existe?
		
		//$RESULTS = db_query_2_array( $q );
		//$qty = count($RESULTS);
		if ($qty<1) {
			return array( "ok"=> false, "qty"=> 0, "error"=> "ID inexistant", "query"=> $q );
		}
		//--ca nous a permit de prendre copie des valeurs existantes----
		$keys_vals = $DETAIL; ///$RESULTS[0];
		$keys = keys_of_array( $keys_vals );
		$sep = "";
	
		//--on est certain (pendant qq millisec) qu'il est existant
		$q = "DELETE FROM $tbl WHERE $specialWhereClause";//--rollback request complete 
		$q1 = '';
		$q2 = '';
	
		foreach( $keys as $ky ) {
			$new = str_replace( "`", "", $keys_vals[$ky] ); //on enlève notre esc-char, qui devrait ne pas être utilisé de toute façon
			$esc = (($new=='NULL') || ($new=='NOW()') || in_array($ky,$dontEscapeThoseValues)) ? "" : "`";
			$q1  .= $sep.$ky;
			$q2  .= $sep.$esc.$new.$esc;
			$sep = ', ';
		}
		$rb = "INSERT INTO $tbl ($q1) VALUES ($q2)";

		//--on change la base de données-------------
		$res = db_query( $q );
		if ($res) {
			$qty = db_affected_rows($res);
			return array( "ok"=> true, "qty"=> $qty, "query"=> $q, "rollback"=> $rb );
		}
		return array( "ok"=> false, "qty"=> 0, "error"=> db_error(), "query"=> $q );
	}


	function db_select_some(  &$loadedData, &$indexData,  $fieldsToReturnAsRecordList, $dbTableName, $whereClause='true', $orderClause='', $indexKeyName='id', $limit=0 ) {
		if ($limit>0) $limit = "LIMIT $limit"; else $limit='';
		if ($orderClause) $orderClause = "ORDER BY ".$orderClause;
		$qSEL = "SELECT $fieldsToReturnAsRecordList FROM $dbTableName WHERE $whereClause $orderClause $limit";
		//
		//CODE PARTAGÉ
		$ALL = db_query_2_array( $qSEL );
		//printerr($qSEL);
		global $SQLERROR;
		if ($SQLERROR) {
			//erreur sql!!
			//printerr($SQLERROR);
			return 0;
		}
		else {
			$keys = explode(',',$fieldsToReturnAsRecordList);
			foreach( $ALL as $REC ){
				$rec = array();
				foreach( $keys as $ky ) {
					$ky = trim($ky);
					$rec[$ky] = $REC[$ky];
				}
				$loadedData[] = $rec;
				$indexData[] = $rec[ $indexKeyName ]; //index des id, dans l'ordre
			}
		}
		return 1;
	}
	
	function db_select_complex(  &$loadedData, &$indexData,  $fieldsToReturnAsRecordList, $completeClausePlease, $indexKeyName='id' ) {
		$qSEL = $completeClausePlease;
		//
		//CODE PARTAGÉ
		$ALL = db_query_2_array( $qSEL );
		//printerr($qSEL);
		
		global $SQLERROR;
		if ($SQLERROR) {
			//erreur sql!!
			//printerr($SQLERROR);
			return 0;
		}
		else {
			$keys = explode(',',$fieldsToReturnAsRecordList);
			foreach( $ALL as $REC ){
				$rec = array();
				foreach( $keys as $ky ) {
					$ky = trim($ky);
					$rec[$ky] = $REC[$ky];
				}
				$loadedData[] = $rec;
				$indexData[] = $rec[ $indexKeyName ]; //index des id, dans l'ordre
			}
		}
		return 1;
	}
	function db_select_vanilla(  &$loadedData, $qSEL ) {
		global $SQLERROR, $DB_LNK;
		db_connect();
		$r = db_query( $qSEL );
		if ($r) {
			unset($SQLERROR);
			while ( $DETAIL = mysqli_fetch_array( $r, MYSQLI_NUM ) ) {
				$loadedData[] = $DETAIL;
			}
			return 1;
		}
		$loadedData[] = $SQLERROR;
		return 0;
	}
	function db_select_simplier(  &$loadedData, $fieldsToReturnAsRecordList, $completeClausePlease ) {
		global $trackEachQueryIntoLogFile;
		$qSEL = $completeClausePlease;
		//
		//CODE PARTAGÉ
		$trackEachQueryIntoLogFile = 1;
		$ALL = db_query_2_array( $qSEL );
		//printerr($qSEL);
		
		global $SQLERROR;
		if ($SQLERROR) {
			//erreur sql!!
			//printerr($SQLERROR);
			$loadedData[] = $SQLERROR;
			return 0;
		}
		else {
			$keys = explode(',',$fieldsToReturnAsRecordList);
			$tot = count($keys);
			for($i=0; $i<$tot; $i++) {
				$ky = trim($keys[$i]);
				if (strpos($ky, " as ")!==false) {
					$parts = explode(" as ",$ky);
					$keys[$i] = trim($parts[1]);
				}
				else {
					$keys[$i] = $ky;
				}
			}
			//avertir( "KEYS:[" .implode(',', $keys)."]" );
			foreach( $ALL as $REC ){
				$rec = array();
				foreach( $keys as $ky ) {
					$rec[] = $REC[$ky];
				}
				//avertir( "VALS:[" .implode(',', $rec)."]" );
				$loadedData[] = $rec;
			}
		}
		return 1;
	}



	function array_to_createTableQuery( $tables, $tableName ) {
		$table = $tables[$tableName];
		$fields = $table["fields"];
		$primary = $table["primary"];
		$q = "DROP TABLE `$tableName`;\n"; 
		$q .= "CREATE TABLE `$tableName` (\n"; 
		foreach( $fields as $fld => $def ) {
			$typ = $def['sqltype'];
			$isNULL = ($typ=='datetime') ? "NULL" : (!isset($def['notNULL'])) ? "NULL" : "NOT NULL";
			$default = ($typ=='boolean') ? "DEFAULT FALSE" : "";
			$options = ($typ=="blob") ? '' : "COLLATE utf8_general_ci $isNULL $default";
			$q .= "\t`$fld` $typ $options,\n"; 
		}
		$q .= "\tPRIMARY KEY(`$primary`)\n"; 
		$q .= ") ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;"; 
		return $q;
	}




?>