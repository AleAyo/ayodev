<?php
	//
	/**
	 * @license
	 * buildphpview.php - v0.1
	 * Copyright (c) 2016, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/
	ini_set('display_errors', 1);
	error_reporting(E_ERROR | E_PARSE);
	

	function createsubitem( &$biglst, &$cursor, &$intowhat, $pad ){
		for( ; ($cursor[1] < 1000) && ($cursor[1] < $cursor[0]); $cursor[1]++ ) {
			$itm = trim($biglst[ $cursor[1] ]);
			//
			//
			if (strlen($itm) == 0) continue;
			//
			if ($itm == "^") {
				return; //--------------------end of this array!!------> return
			}
			//
			if (!(strpos($itm, "<?" ) === false)) continue;
			if (!(strpos($itm, "//") === false)) continue; //conséquence: pas de // dans le record user

			$parts = explode(":", $itm);
			$qty = count( $parts );
			// préparer comment l'ajout sera fait: avec ou sans key
			if ($qty==1) {
				$p2 = trim($parts[0]);
				$key = '';
			}
			else {
				$key = trim( array_shift($parts) );
				$p2 = trim( implode(':', $parts) ); // au cas ou le string contenait d'autres ":"
			}

			if ($p2 == '') {
				$value = array();
				$cursor[1]++;
				//print( $pad. "[". $cursor[1] ."]--[ $key :\n" );
				createsubitem( $biglst, $cursor, $value, $pad.$pad );
				//print( $pad. "......]\n" );
			}
			else {
				//print( $pad. "[". $cursor[1] ."]--  $key : $p2 \n" );
				$value = addslashes( crly($p2) );
			}
			
			if ($key=='') {
				$intowhat[] = $value;
			}
			else {
				$intowhat[ $key ] = $value; //pas de verif si overwrite
			}
		}
		//big list finish without a ^   ...bad formatting
	}
	
	function gimmetheviewdef( &$record, $fichier ) {
		$dataread = file_get_contents( $fichier );
		if ($dataread === false) {
			print 'probleme lecture fichier '.$fichier;
			$record['error'] = 'probleme lecture fichier '.$fichier;
			return false;
		}
		else {
			$lst = preg_split("/\R/", $dataread);
			$tot = count($lst);
			$cursor = array( count($lst), 0 );
			createsubitem( $lst, $cursor, $record, '  ' );
			return true; //ou tenir compte erreurs dans createsubitem() ??
		}
	}
	function writePhpObject( $fh, &$someobj, $pad, $nopad ) {
		if (is_array($someobj)) {
			$padprec = substr($pad,0,-4);
			if (isset($someobj[0])) {
				fwrite( $fh, ($nopad?'':$padprec)."array( \n");
				$tot = count($someobj); $totm1 = $tot-1;
				for($i=0; $i<$tot; $i++) {
					$val = $someobj[$i];
					writePhpObject( $fh, $val, $pad."    ", 0 );
					fwrite( $fh, ($i==$totm1 ? '' : ",\n"));
				}
				fwrite( $fh, "\n$pad)");
			}
			else {
				$keys = array_keys( $someobj );
				fwrite( $fh, ($nopad?'':$padprec)."array( \n");
				$tot = count($keys); $totm1 = $tot-1;
				for($i=0; $i<$tot; $i++) {
					$key = $keys[$i];
					$val = $someobj[ $key ];
					fwrite( $fh, "$pad\"$key\" => ");
					writePhpObject( $fh, $val, $pad."    ", 1 );
					fwrite( $fh, ($i==$totm1 ? '' : ",\n"));
				}
				fwrite( $fh, "\n$pad)");
			}
		}
		else {
			if (strpos($someobj, "[") !== false) {
				$crud = str_replace('[', '', $someobj);
				$crud = str_replace(']', '', $crud);
				$crudlst = explode(',', $crud);
				if (count($crudlst) >= 4) {
					fwrite( $fh, "array(". 1*$crudlst[0].", ". 1*$crudlst[1].", ". 1*$crudlst[2].", ". 1*$crudlst[3] .")");
				}
			}
			else {
				if ($nopad) $pad='';
				$someobj = trim($someobj); //safe
				if (($someobj == 'true') || ($someobj == 'false') || ($someobj == 'NULL')) fwrite( $fh, $pad.strtolower($someobj) );
				elseif (is_numeric($someobj)) fwrite( $fh, "$pad$someobj" );
				else fwrite( $fh, "$pad\"$someobj\"" );
			}
		}
	}
	function prep_php_viewdef( &$record, $fichier ){
		//writing php code
		$fh = fopen( $fichier, 'w' ); 
		if (!$fh) {
			print 'probleme écriture fichier '.$fichier;
			 //-----------------------------------------------> return
			return false;
		}
		$head = "<?php /*---- dern m-a-j: ".date("Y-m-d G:i:s")."----*/\n\n";
		fwrite( $fh, $head );
		
		fwrite( $fh, "if (!is_array(\$appTables)) \$appTables = array();\n" );
		//fwrite( $fh, "\$appTables = array( \n" );
		
		$pad = "    ";
		$keys = array_keys( $record );
		$tot = count($keys); $totm1 = $tot-1;
		print "($fichier) -- total records : $tot\n";
		for($i=0; $i<$tot; $i++) {
			$key = $keys[$i];
			$val = $record[ $key ];
			$createtableSQL = $val['createtableSQL'];
			if ($createtableSQL) unset( $val['createtableSQL']);

			fwrite( $fh, "\$appTables[\"$key\"] = ");
			writePhpObject( $fh, $val, $pad.$pad, 1 );
			//print "$key = \n";
			//var_dump($val);
			fwrite( $fh, ";\n" );
			if ($createtableSQL) {
				fwrite( $fh, $createtableSQL );
			}
		}
		fwrite( $fh, "\n\n\n?>" );
		/*
		*/
		fclose( $fh );
		print "($fichier) DONE.\n";
	}

	function writeJSObject( $fh, &$someobj, $pad, $nopad ) {
		if (is_array($someobj)) {
			$padprec = substr($pad,0,-4);
			if (isset($someobj[0])) {
				fwrite( $fh, ($nopad?'':$padprec)."[ \n");
				$tot = count($someobj); $totm1 = $tot-1;
				for($i=0; $i<$tot; $i++) {
					$val = $someobj[$i];
					writeJSObject( $fh, $val, $pad."    ", 0 );
					fwrite( $fh, ($i==$totm1 ? '' : ",\n"));
				}
				fwrite( $fh, "\n$pad]");
			}
			else {
				$keys = array_keys( $someobj );
				fwrite( $fh, ($nopad?'':$padprec)."{ \n");
				$tot = count($keys); $totm1 = $tot-1;
				for($i=0; $i<$tot; $i++) {
					$key = $keys[$i];
					//
					if ($key == 'createtableSQL') continue;
					//
					$val = $someobj[ $key ];
					fwrite( $fh, "$pad$key : ");
					writeJSObject( $fh, $val, $pad."    ", 1 );
					fwrite( $fh, ($i==$totm1 ? '' : ",\n"));
				}
				fwrite( $fh, "\n$pad}");
			}
		}
		else {
			if ($nopad) $pad='';
			$someobj = trim($someobj); //safe
			if (($someobj == 'true') || ($someobj == 'false') || ($someobj == 'NULL')) fwrite( $fh, $pad.strtolower($someobj) );
			elseif (is_numeric($someobj)) fwrite( $fh, "$pad$someobj" );
			else fwrite( $fh, "$pad\"$someobj\"" );
		}
	}
	function prep_js_viewdef( &$record, $fichier ){
		//writing js DB
		$fh = fopen( $fichier, 'w' ); 
		if (!$fh) {
			print 'probleme écriture fichier '.$fichier;
			 //-----------------------------------------------> return
			return false;
		}
		$head = "/*---- dern m-a-j: ".date("Y-m-d G:i:s")."----*/\n\n";
		fwrite( $fh, $head );
		
		fwrite( $fh, "if (!window.applicationTableViews) window.applicationTableViews= {};\n\n" );
		//fwrite( $fh, "var appViews = { \n" );
		
		$pad = "    ";
		$keys = array_keys( $record );
		$tot = count($keys); $totm1 = $tot-1;
		for($i=0; $i<$tot; $i++) {
			$key = $keys[$i];
			$val = $record[ $key ];
			fwrite( $fh, "window.applicationTableViews.$key = ");
			writeJSObject( $fh, $val, $pad.$pad, 1 );
			fwrite( $fh, ";\n" );
		}
		fwrite( $fh, "\n\n\n" );
		/*
		*/
		fclose( $fh );
		print "($fichier) DONE.\n";
	}

	function crly($s, $rep='’') {
		return str_replace("'", $rep, $s);    // --- replace std ' par unicode curly ’
	}

	function createTableSQL_forOneView( &$view, $viewName ) {
		$fields = &$view['fields'];
		//
		//
		if (!$view['viewName']) $view['viewName'] = $viewName;
		//
		//
		$sql_tableName = $view['sqlTable']; 
		if (!$sql_tableName) $sql_tableName = $viewName;
		$view['sqlTable'] = $sql_tableName;
		//
		$sqlcreatefields = array();
		$sqlchangesfields = array();
		$columnSelectNames = array();
		$sqlidkey = '';
		//
		//$tot = count($fields);
		//for($i=0; $i<$tot; $i++) {
		//	$fld = $fields[$i];
		foreach( $fields as $fid => $fld ) {
			//
			$colName = $fld['colName']; if (!$colName) { $colName = $fid; }
			$fields[$fid]['colName'] = $colName;
			//
			$cr = $fld['colRequest'];
			if (!$cr) {
				$cr = $colName;
			}
			$columnSelectNames[] = $cr;
			$fields[$fid]['colRequest'] = $cr;

			$colVirtual = $fld['colVirtual'];
			
			if ($colVirtual != 'true') {
				if ($colName == 'id') {
					$sqlidkey = ",\n    PRIMARY KEY (id)";
				}
				$sqlDef = $fld['sqlDef'];
				if (!$sqlDef) $sqlDef = "varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL";
				else {
					if (strpos($sqlDef,"TEXT")!==false) {
						$sqlDef = str_replace( "TEXT", "TEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci", $sqlDef);
					}
					elseif (strpos($sqlDef,"CHAR")!==false) {
						$sqlDef = str_replace( ") ", ") CHARACTER SET utf8 COLLATE utf8_unicode_ci ", $sqlDef);
					}
					else {
						//
						//$sqlDef = $sqlDef." ??";
					}
				}
				$previousName = $fld['previousName']; if (!$previousName) $previousName = $colName;
				$sqlcreatefields[] = "$colName $sqlDef";
				$sqlchangesfields[] = "$previousName $colName $sqlDef";
			}
			//
		}
		$sqlcreateBEGIN = "DROP TABLE IF EXISTS $sql_tableName;\nCREATE TABLE $sql_tableName ( \n    ";
		$sqlcreateEND = "\n) ENGINE=MyISAM DEFAULT CHARSET=utf8";
		$t = "\n/*\n";
		$t .= $sqlcreateBEGIN. join(",\n    ", $sqlcreatefields) . $sqlidkey. $sqlcreateEND."\n\n";
		//PAS NECESSAIRE??  
		//
		$t .= "\n --------------------- ALTER ADDs\n";
		foreach( $sqlcreatefields as $sqlfld ){
			$t .= "ALTER TABLE $sql_tableName ADD $sqlfld;\n";
		}
		$t .= "\n --------------------- ALTER CHANGESs\n";
		foreach( $sqlchangesfields as $sqlfld ){
			$t .= "ALTER TABLE $sql_tableName CHANGE $sqlfld;\n";
		}
		//
		$t .= "\n";
		// view[limitRequest]  est plus complexe...
		$sql_joinRequest = $view['joinRequest'];
		if (!$sql_joinRequest) $sql_joinRequest = $sql_tableName;
		$t .= "SELECT ".join(", ", $columnSelectNames)." FROM $sql_joinRequest ".$view['whereRequest'].' '.$view['orderRequest'];
		$t .= "\n\n";
		$t .= "*/\n";

		//print $t;
		$view['createtableSQL'] = $t;
		//
	}
	
	function createTableSQL( &$record ) {
		$keys = array_keys( $record );
		$tot = count($keys); $totm1 = $tot-1;
		for($i=0; $i<$tot; $i++) {
			$key = $keys[$i];
			print( "<hr>" );
			createTableSQL_forOneView( $record[ $key ], $key );
		}
		print "<hr>createTableSQL DONE.\n";
	}
	
	
	function prep_viewdef( $folderpath, $fileName ) {
		//$fileName = baseName( $fullpath, '.php' );
		//$folderpath = dirName( $fullpath ).'/';
		$fullpath = $folderpath.$fileName."_def.php";

		$record = array();
		if (gimmetheviewdef( $record, $fullpath )) {
			createTableSQL( $record );
			print( "\n" );

			$f = $folderpath.$fileName;
			$fphp = $f.".php";
			prep_php_viewdef( $record, $fphp );
			//prep_js_viewdef(  $record, $f.".js" );
			print "<hr>";
			$dataread = file_get_contents( $fphp );
			if ($dataread !== false) {
				print htmlspecialchars( $dataread );
			}
		}
		else {
			//on a déjà imprimé l'erreur?
		}

		print "<hr>";
		echo date("Y-m-d G:i:s");
		print "<hr>";
	}
?>