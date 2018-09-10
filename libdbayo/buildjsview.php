<?php
	//
	/**
	 * @license
	 * buildjsview.php - v0.1
	 * Copyright (c) 2016, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/
	ini_set('display_errors', 1);
	error_reporting(E_ERROR | E_PARSE);
	
	function printValue( $value, &$manylines, $tabs, $hereisa, $prem ) {
		if (is_array($value)) {
			$tabs2 = "$tabs\t";
			$keys = array_keys($value); 
			if ($keys[0] == "0") {
				$ttt = count($value); $tttm1 = $ttt-1;
				$isa = false;
				for($k = 0; $k < $ttt; $k++) {
					$vvv = $value[ $k ];
					if (is_array($vvv)) {
						$isa = true;
						break;
					}
				}
				$manylines[] = (($hereisa && $prem) ? "\n$tabs" : '')."[ ";//.($isa ? "\n$tabs2" : ' ');
				for($k = 0; $k < $ttt; $k++) {
					$vvv = $value[ $k ];
					//$manylines[] = ($hereisa ? "\n$tabs2" : ' ');
					printValue( $vvv, $manylines, $tabs2, $isa, ($k==0) );
					$manylines[] = (($k == $tttm1) ? '' : ','.($isa ? "\n$tabs2" : ' ') );
				}
				$manylines[] = ($isa ? "\n$tabs" : ' ')."]";
			}
			else {
				$tut = count($keys); $tutm1 = $tut-1;
				$isa = false;
				for($j=0; $j<$tut; $j++) {
					$fky = $keys[$j];
					$vvv = $value[$fky];
					if (is_array($vvv)) {
						$isa = true;
						break;
					}
				}
				//
				$manylines[] = (($hereisa && $prem) ? "\n$tabs" : '')."{".($isa ? "\n$tabs2" : ' ');
				for($j=0; $j<$tut; $j++) {
					$fky = $keys[$j];
					$vvv = $value[$fky];
					//
					$manylines[] = "$fky : ";
					printValue( $vvv, $manylines, $tabs2, $isa, ($j==0) );
					$manylines[] = (($j == $tutm1) ? '' : ','.($isa ? "\n$tabs2" : ' ') );//. ($hereisa ? "\n$tabs" : ' ');
				}
				$manylines[] = ($isa ? "\n$tabs" : ' ')."}";
			}
		}
		elseif (is_numeric($value)) {
			$manylines[] = "$value";
		}
		elseif (is_bool($value)) {
			$manylines[] = $value ? 'true':'false';
		}
		else {
			$fvl = $value;//addslashes($value);
			$manylines[] = "\"$fvl\"";
		}
	}
	
	function calculLevelCrud( &$view ) {
		global $usr_level;

		$columnCuteNames = array();
		//$columnSelectNames = array();
		$columnNames = array();
		$columnLooks = array();
		$columnHTMLs = array();
		$columnMultilines = array();
		//
		$deleteAccept = false;
		$addAccept = false;
		//
		$reccrud = $view['levelCRUD'];
		if (!$reccrud) {
			$view['deleteAccept'] = false;
			$view['addAccept'] = false;
		}
		else {
			$delet = $reccrud[0];
			$creat = $reccrud[3];
			$view['deleteAccept'] = ($usr_level >= $delet);
			$view['addAccept'] = ($usr_level >= $creat);
		}
		//
		$fields = $view['fields'];
		$finalflds = array();
		
		foreach( $fields as $fld ) {
			$colName = $fld['colName'];
			$colVirtual = $fld['colVirtual'];
			//
			$crud = $fld['levelCRUD'];
			if (!$crud) $crud = $reccrud;
			if ((!$crud) || (count($crud)<4)) {
				$crud = array( 009, 009, 009, 009 );
			}
			$read = max( 009, $crud[1]);
			$updt = max( 009, $crud[2]);
			if ($updt < $read) $read = $updt;
			//
			$looks = '';
			//
			if ($colVirtual == 'true') $updt = 009; //impossible de la modifier
			
			if ($read > $usr_level) $looks = '_';
			else if ($updt > $usr_level) $looks = '!'; //read but not change
			else {
				$valuechoices = $fld['valueChoices'];
				if ($valuechoices) $looks = $valuechoices;
				else $looks = '*';
			}
			
			if (($colName == 'id') || ($looks != '_')) {
				$columnLooks[] = $looks;
				$columnCuteNames[] = ( $cr = $fld['cuteName'] ) ? $cr : $colName;
				$columnNames[] = $colName;
				$columnHTMLs[] = ($fld['htmlAccept'] == 'true') ? true : false;
				$columnMultilines[] = ($fld['isMultiline'] == 'true') ? true : false;
				//
				unset( $fld['levelCRUD']);
				unset( $fld['sqlDef']);
				$finalflds[] = $fld;
			}
			//
		}
		$view['fields'] = $finalflds;
		$view['columnNames'] = $columnNames;
		$view['columnCuteNames'] = $columnCuteNames;
		$view['columnLooks'] = $columnLooks;
		$view['columnHTMLs'] = $columnHTMLs;
		$view['columnMultilines'] = $columnMultilines;
		
		unset( $view['joinRequest']);
		//unset( $view['idprefix']);
		unset( $fld['levelCRUD']);
		unset( $view['fields']);
		unset( $view['tables']);
	}
	
	function printTableJS( &$allTables, &$manylines ) {
		global $usr_level;
		$dontexport = array( 'whereRequest', 'orderRequest', 'limitRequest', 'sqlTable', 'sqlDatabase', 'levelCRUD' );
		//
		$manylines[] = "if (!window.applicationTableViews) window.applicationTableViews= {};\n// levelsession = $usr_level\n\n";
		foreach( $allTables as $name => $table ) {
			//calcul levelCRUD
			calculLevelCrud( $allTables[$name] );
		}
		foreach( $allTables as $name => $table ) {
			$manylines[] = "window.applicationTableViews.$name = { \n";
			$keys = array_keys( $table );
			//
			$tot = count($keys); $totm1 = $tot-1;
			for($i=0; $i<$tot; $i++) {
				$key = $keys[$i];
				if (in_array( $key, $dontexport )) continue;
				//
				$value = $table[$key];
				//
				$manylines[] = "\t"."$key : ";
				printValue( $value, $manylines, "\t" );
				
				$manylines[] = ",\n";
			}
			//
			/*
			$manylines[] = "\t"."columnCuteNames : [ ".join(', ', $columnCuteNames)." ],\n";
			//$manylines[] = "\t"."zxczxc = [".join(', ', $asdasd)."],\n";
			$manylines[] = "\t"."columnNames : [ ".join(', ', $columnNames)." ],\n";
			$manylines[] = "\t"."columnLooks : [ ".join(', ', $columnLooks)." ]\n";
			*/
			$manylines[] = "}\n\n\n";
		}
	}
	
	//
	
	function prep_viewdef( $folderpath, $filename ) {
		//$filename = basename( $fullpath, '.php' );
		//$folderpath = dirname( $fullpath ).'/';
		$fullpath = $folderpath.$filename.".php";

		print "fullpath = $fullpath<hr>";
		include $fullpath;

		if (0) {
			$manylines = array();
			printTableJS( $appTables, $manylines );
			print join( '', $manylines );
		}
		else {
			foreach( $appTables as $name => $table ) {
				calculLevelCrud( $appTables[$name] );
			}
			//var_dump( $appTables );
			print "var appTables = ". json_encode( $appTables, true );
		}

		print "<hr>";
		echo date("Y-m-d G:i:s");
	}
?>