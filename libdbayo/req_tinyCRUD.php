<?php
	//
	/**
	 * @license
	 * req_tinyCRUD.php - v0.1
	 * Copyright (c) 2016, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/

	avertir( "req_tinyCRUD ------------", '','');
	ini_set('display_errors', 1);
	error_reporting(E_ERROR | E_PARSE);

	//vertir( "req_tinyCRUD -------a----", '','');
	include_once svp_paths("libdbayo/def.php") ;
	
	//vertir( "req_tinyCRUD -------b----", '','');
	include_once svp_paths("libdbayo/def_db.php") ;

	function rid_of_tags($string, $space=' ', $isMultiline ) { 
		if ($string=='') return '';
		//
	    // ----- remove HTML TAGs ----- 
	    $string = preg_replace ('/<[^>]*>/', $space, $string); 

	    $string = str_replace("'", '’', $string);    // --- replace std ' par unicode curly ’

	    // ----- remove control characters ----- 
	    $string = str_replace("\r", '', $string);    // --- replace with empty space
	    $string = str_replace("\t", $space, $string);   // --- replace with space
		if ($isMultiline) {} //NON RIEN: $string = str_replace("\n", '\n', $string);   // --- replace with \n
	    else $string = str_replace("\n", $space, $string);   // --- replace with space

	    // ----- remove multiple spaces ----- 
	    $string = trim(preg_replace('/ {2,}/', $space, $string));

	    return $string; 

	}
	
	function crly($s, $rep='’') {
		return str_replace("'", $rep, $s);    // --- replace std ' par unicode curly ’
	}
	
	function calculLevelCrud( &$view ) {
		global $usr_level;

		$columnCuteNames = array();
		//$columnSelectNames = array();
		$columnNames = array();
		$columnLooks = array();
		$columnHTMLs = array();
		$columnMultilines = array();
		//new 2017sept13 p/r cuisivoilà
		$columnTypingSearch = array();
		$columnTypingChoices = array();
		//
		$tabs = array();
		//
		$deleteAccept = false;
		$addAccept = false;
		//
		$reccrud = $view['levelCRUD'];
		if (!$reccrud) {
			$view['deleteAccept'] = false;
			$view['addAccept'] = false;
			$reccrud = array( 10, 10, 10, 10 ); ///10 est pour pouvoir cacher de DIEU (le top dev level=9)
		}
		else {
			$creat = (isset($reccrud[0])) ? $reccrud[0]*1 : 10;
			$delet = (isset($reccrud[3])) ? $reccrud[3]*1 : 10;
			if (!isset($reccrud[1])) $reccrud[1] = 10;
			if (!isset($reccrud[2])) $reccrud[2] = 10;
			$view['deleteAccept'] = ($usr_level >= $delet);
			$view['addAccept'] = ($usr_level >= $creat);
		}
		//
		$fields = $view['fields'];
		//$finalflds = array();
		$tabrendu = 0;
		
		foreach( $fields as $fid => $fld ) {
			$colName = $fld['colName']; if (!$colName) $colName = $fid;
			//
			$colVirtual = $fld['colVirtual'];
			$willBeHidden = ($fld['colHidden'] == 'true') ? true : false;
			$idCanBeEdited = $fld['isEditable'];//just pour le id, on s'en fout pour les autres
			//
			$crud = $fld['levelCRUD'];
			if (!$crud) $crud = $reccrud;
			//
			$read = min( 10, (isset($crud[1])) ? $crud[1]*1 : $reccrud[1] );
			$updt = min( 10, (isset($crud[2])) ? $crud[2]*1 : $reccrud[2] );
			//
			if ($updt < $read) $read = $updt;
			//
			$looks = '';
			//
			if ($colVirtual == 'true') $updt = 666; //impossible de la modifier
			
			if ($willBeHidden) $looks = '_'; //just not shown to user (c'est différent de ne pas y avoir accès, ne pas recevoir l'info)
			else if ($updt > $usr_level)  $looks = '!'; //can see it but not change
			else {
				$valuechoices = $fld['valueChoices'];
				if ($valuechoices) $looks = $valuechoices;
				else $looks = '*';
			}
			
			if (($read <= $usr_level) || ($colName == 'id')) {
				if (($colName == 'id')&&(!$idCanBeEdited)) $columnLooks[] = '_'; //id forcé pas visible (mais envoyé) sauf si spécifié "isEditable"
				else $columnLooks[] = $looks;
				
				if (($looks != '!') || ($looks != '_')) {
					$tabs[] = $tabrendu;
				}
				$tabrendu += 1;
				
				$columnCuteNames[] = crly(( $cr = $fld['cuteName'] ) ? $cr : $colName );
				$columnNames[] = crly( $colName );
				//
				$columnHTMLs[] = ($fld['htmlAccept'] == 'true') ? true : false;
				$columnMultilines[] = ($fld['isMultiline'] == 'true') ? true : false;
				
				//new 2017sept13 p/r cuisivoilà
				$typing = crly( $fld['typingSearch'] );
				if ($typing) {
					$columnTypingSearch[] = $typing;
					$columnTypingChoices[] = $fld['typingChoices'];
					// override valueChoices if it was also defined (by error)
					$looks = '*';
				}
				else {
					$columnTypingSearch[] = false;
					$columnTypingChoices[] = null;
				}
			}
			else {
				//avertir("pas accès [$colName], read=[$read], usr=[$usr_level]");
			}
			//
		}
		//$view['fields'] = $finalflds;
		unset( $view['fields']);
		//
		$view['columnNames'] = $columnNames;
		$view['columnCuteNames'] = $columnCuteNames;
		$view['columnLooks'] = $columnLooks;
		$view['columnHTMLs'] = $columnHTMLs;
		$view['tabs'] = $tabs;
		$view['columnMultilines'] = $columnMultilines;
		//new 2017sept13 p/r cuisivoilà
		$view['columnTypingSearch'] = $columnTypingSearch;
		$view['columnTypingChoices'] = $columnTypingChoices;
		
		unset( $view['joinRequest']);
		unset( $view['orderRequest']);
		unset( $view['whereRequest']);
		unset( $view['sqlDatabase']);
		unset( $view['sqlTable']);
		unset( $view['levelCRUD']);
		//unset( $view['idprefix']);
		unset( $view['tables']);
	}
	///

	$dataReturned = array();	
	
	$crud = 			$data['crud'];
	$views_file = 		$data['views_file']; 
	$view_name = 		$data['view_name']; 
	$record_id = 		$data['record_id'];
	$column_name = 		$data['column_name'];
	$column_value = 	$data['column_value'];
	$dont_send_viewSpec = 	$data['dont_send_viewSpec'];
	$where_clause_supp = $data['where_clause']; //without WHERE
	$order_clause = 	$data['order_clause']; // without ORDER
	
	//======LEVEL special case======
	if ($where_clause_supp == 'level') {
		$where_clause_supp = "level <= $usr_level";
	}
	
	$good_cruds = array('c','r','u','d');
	$actdigit = array_search( $crud, $good_cruds );
	
	if ($actdigit === false) {
		$dataReturned['ok'] = false;
		$dataReturned['error'] = "bad CRUD";
		avertir( "req_tinyCRUD ..... error:", $dataReturned['error'] );
	}
	elseif ((!$record_id) && ($actdigit > 1)) { // ($actdigit != 1))
		// create, update, delete EXIGENT UN RECORD ID
		// OUPS pas create: il peut se débrouiller maintenant à créer un id tout seul, avec le bon prefix!
		$dataReturned['ok'] = false;
		$dataReturned['error'] = "missing record id";
		avertir( "req_tinyCRUD ..... error:", $dataReturned['error'] );
	}
	else {
		//
		$usr_level = ($usr_level*1);

		if (!$tinyCRUD_views_path) $tinyCRUD_views_path = 'app/views/';
		$viewsDefinitionFile = $tinyCRUD_views_path.$views_file.'.php';

		if ((include $viewsDefinitionFile) === FALSE) { //tRuE FaLse... any mixed case is also acceptable!!!!
			$dataReturned['ok'] = false;
			$dataReturned['error'] = "bad VIEWDEFs file [$viewsDefinitionFile]";
		}
		else {
			avertir( "req_tinyCRUD ..... ", $viewsDefinitionFile );
			//
			$view_spec = $appTables[$view_name];
			//var_dump( $view_spec );
			//
			if (!$view_spec) {
				$dataReturned['ok'] = false;
				$dataReturned['error'] = "bad view_name in VIEWDEFs[$view_name] in [$viewsDefinitionFile]";
			}
			else {
				$sqlTable = $view_spec['sqlTable'];
				if (!$sqlTable) $sqlTable = $views_file; //on assume que tout le fichier de views concerne la même table (plusieurs façons de voir les mêmes données)
				//
				$BADLEVEL = false;
				$recordCRUD = $view_spec['levelCRUD'];
				$fields = $view_spec['fields'];
				//
				if (($actdigit == 0) || ($actdigit == 3)) { //record level action (creation, deletion)
					$BADLEVEL = ($recordCRUD[$actdigit] > $usr_level);
				}
				//
				$table_level = implode(', ', $recordCRUD);
				avertir( "req_tinyCRUD", "user_level=[$usr_level]" );
				avertir( "req_tinyCRUD", "crud_level=[$table_level]  actdigit=[$actdigit]" );

				if ($BADLEVEL) {
					$dataReturned['ok'] = false;
					$dataReturned['error'] = "Pas les autorisations suffisantes";
					avertir( "SECURITY req_tinyCRUD", 'BADLEVEL', "usr_level:($usr_level) sur table/view:($sqlTable / $view_name) pour act $actdigit\n".
						'crud=('.$data['crud'].
						'), view_name=('.$view_name.
						'), sqlTable=('.$sqlTable.
						'), record_id=('.$record_id.
						'), column_name=('.$column_name.
						'), column_value=('.$column_value.')', 
					true ); //email!!
				}
				else {
					//
					//ajouter ici les variable forcées par la session (ex: id_client, id_groupe, etc)
					//delete en a besoin (ils en ont tous besoin!)
					$forced_sessions_variables = $view_spec['session_variables'];
					$ANDs = array();
					if ($forced_sessions_variables) {
						foreach( $forced_sessions_variables as $forsesvar ) { /// WHAT IF THEY ARE **NOT** PRESENT IN SESSION?
							 $forsesvalue = $SESSYO[$forsesvar];
							 if ($forsesvalue == null) continue;//??
							 if ($actdigit != 2) $record[$forsesvar] = $forsesvalue;// juste pas en Update (IMPORTANT: si il a changé de client_id, il n'a plus accès à modifier de record!
							 $ANDs[] = "($forsesvar = `$forsesvalue`)"; // create (0) ne l'utilise pas
						} 
					}
					//
					//
					if ($actdigit < 3) {  // 0,1,2
						//
						$record = array();
						$keys = array();
						//
						if ($column_name=='') $column_name = false;
						else if (!is_array( $column_name )) $column_name = array( $column_name );
						//
						if ($column_value=='') $column_value = false;
						elseif (!is_array( $column_value )) $column_value = array( $column_value );
						//
						//$allkeys = array_keys( $fields );
						//$with_level = array_search( 'level', $allkeys );
						//
						//
						// à quel colonnes avez-vous accès (parmi celles que vous avez spécifiées) ?
						foreach( $fields as $k => $fld ) {
							//-------------------------------- check security field-wise
							if ($column_name) {
								if (!in_array($k, $column_name)) {
									avertir("...colonne [$k] pas demandée : fld = [$fld]");
									continue;
								}
								else {
									$jj = array_search( $k, $column_name );
								}
							}
	
							if ($k == 'id') {
								$keys[] = 'id';
								$v = $column_value[$jj];
							}
							else {
								$fieldCRUD = $fld['levelCRUD'];
								if (!is_array($fieldCRUD)) { 
									if ($recordCRUD[$actdigit] > $usr_level) continue; //pas accès si cell level > usr_level
								}
								elseif ($fieldCRUD[$actdigit] > $usr_level) continue;
								//------------------------------------------ end normal security

								if (($actdigit != 1) && ($fld['colVirtual'])) continue;
								//
								//
								//if ($k != 'id') {
									$kr = $fld['colRequest']; if (!$kr) $kr = $k;
									if ($fld['colVirtual']) $kr = "`` as $kr";
									$keys[] = $kr;
								//}
								//
								$goodSessKEY = (isset($fld['fromSESSYO']) && ($actdigit == 0));//à la création seulement
								//
								if ((!$column_value) && (!$goodSessKEY)) { avertir( "...skip...$i", $k ); continue; } 
								//$v = ''; //si les valeurs n'ont pas été définies, y a rien à ajouter(c) ni modifier(u)
								//SAUF si sessKEY est définie, alors on doit forcer la valeur
								//
								//
								//---------------------------------------
								$v = $column_value[$jj];

								//--------------------------------------- LEVEL security
								if ($k == 'level') {
									if (($v*1) > $usr_level) { avertir( "...skipLEVEL...$i", $k." v=[$v], usr=[$usr_level]" ); continue; }
								}
								//--------------------------------------- LEVEL security...ended
								
								// force value from current session SEULEMENT SI create (0)
								if ($goodSessKEY) {
									$sessKEY = $fld['fromSESSYO'];
									if (isset($SESSYOINFO[ $sessKEY ])) {
										$v = $SESSYOINFO[ $sessKEY ];
									}
								}

								$oldv = $v;

								if ($k == 'mtpss') {
									////ne pas écrire un mtpss si urs_level < level de cette ligne
									////problème particulier à edit usagers table : il faudrait savoir la valeur actuelle de cette ligne AVANT, + faut permettre que LUI change son mtpss
									////SOLUTION : ne pas afficher le mtpss dans une affichage en liste de tous les usagers. Interface spéciale pour changer mtpss d'un autre usager
									////PROBLEME : création d'un nouvel usager... faut lui donner un mtpss au hasard?
									$v = cryptaa( $v );
								}
								elseif ($v=='null') 
									$v='NULL'; //protection incomplete... un champs FLOAT peut recevoir '' et ça donne 0 en SQL et non NULL comme on veut
								elseif (!$fld['htmlAccept']) 
									$v = rid_of_tags($v, ' ', $fld['isMultiline'] );
							}
							//else 
							//	$v = htmlspecialchars($v);

							avertir( "...Ok.....$i", $k, "oldv=[$oldv]..v=[$v] ..$goodSessKEY, $sessKEY" );
								
							$record[$k] = $v;
						}
						//
						if ($actdigit == 0) { //c
							if ($record_id=='') {
								include_once svp_paths("libdbayo/uniqID.php");
								//PAS BESOIN: db_new_intern() le fait.....i.e. ceci: $record['id'] = $record_id;
								$prefix = $view_spec['idprefix']; if (!$prefix) $prefix = "XX-";
								$record_id = puniqueIDgeneratorfunction( $prefix, false );
							}
							//
							// db_new(               $tbl,    $keys_vals,   $someID,         $dontEscapeThoseValues, $dontDoIt_returnQuery ) {
							$dataReturned = db_new( $sqlTable, $record, $record_id );
						}
						elseif ($actdigit == 1) { //r
							//FROM req_getlistof.PHP
							//
							if (count($keys)==0) $keys[] = 'false';
							$joinRequest = $view_spec['joinRequest'];
							if (!$joinRequest) $joinRequest = $sqlTable;
							if ($where_clause_supp) $ANDs[] = "($where_clause_supp)";
							if ($record_id) $ANDs[] = "(id = `$record_id`)";
							if ($order_clause) $order_clause = "ORDER BY $order_clause";
							else $order_clause = $view_spec['orderRequest'];
							//
							$strkeys = implode(",",$keys);
							if (count($ANDs)==0) $ANDs[] = 'TRUE';
							$strANDs = implode(" AND ",$ANDs);
							$q = "SELECT $strkeys FROM $joinRequest WHERE $strANDs $order_clause";
							avertir($q);
							//
							$listD = array();
							$ok = db_select_vanilla( $listD, $q );
							if ($ok) {
								if (strpos( $strkeys, 'mtpss') !== false) {
									//oups, on doit decrypter
									$ki = array_search( 'mtpss', $keys );
									$klev = array_search( 'level', $keys );
									avertir("req_getlistof MTPSS:", $strkeys." ki=[$ki], $klev=[$klev]" );

									$tot = count($listD);
									if ($ki < count($keys)) for( $i=0; $i<$tot; $i++ ) {
										$curval = $listD[$i][$ki];
										if ($klev === false) {
											$plain = uncryptaa( $curval );
										}
										else {
											if ( ($listD[$i][$klev]*1) >= $usr_level ) { 
												//pas voir mtpss des patrons et non plus collègues, juste subalternes PROB: on ne verra plus le notre.
												$plain = "************";
											}
											else {
												$plain = uncryptaa( $curval );
											}
										}
										//avertir("req_getlistof ......:", $curval, $plain );
										$listD[$i][$ki] = $plain;
									}
								}
							}
							else {
								$dataReturned['error'] = $listD[0];
							}
							$dataReturned['ok'] = $ok;
							$dataReturned['records'] = $listD;
							//
							if (!$dont_send_viewSpec) {
								calculLevelCrud( $view_spec );
								$dataReturned['viewSpec'] = $view_spec;
							}
						}
						elseif (count($record)==0) {
							$dataReturned['ok'] = true;
							$dataReturned['qty'] = 0;
							$dataReturned['error'] = "Aucune colonne accessible, donc modif inutile";
						}
						elseif ($actdigit == 2) { //u
							$ANDs[] = "(id = `$record_id`)";
							if ($where_clause_supp) $ANDs[] = "($where_clause_supp)";
							$strANDs = implode(" AND ",$ANDs);
							// db_update(                    $tbl,         $keys_vals,   $someID,  $dontEscapeThoseValues, $specialWhereClause )
							$dataReturned = db_update( $sqlTable, $record, $record_id, null, $strANDs );
						}
					}
					else { // ($actdigit == 3) //d
						$ANDs[] = "(id = `$record_id`)";
						$strANDs = implode(" AND ",$ANDs);
						//db_delete(                 $tbl,        $someID,         $dontEscapeThoseValues, $specialWhereClause=null )
						$dataReturned = db_delete( $sqlTable, $record_id, null, $strANDs );
					}
					//
					avertir("req_tinyCRUD SQL:($actdigit)", 'ok=('.$dataReturned['ok'].')  qty=('.$dataReturned['qty']. ') err=('.$dataReturned['error'].') query='.$dataReturned['query'] );
				}
			}
		}

	}
	
	unset($dataReturned['query']);

	//compliqué pour rien? pourquoi pas dans dataReturned[] tout simplement?...
	$dataReturned['what_was_done'] = array(
		'crud' =>          $crud,
		'table_name' =>   $sqlTable,
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
		$error = $dataReturned['error'];
	}
	
?>