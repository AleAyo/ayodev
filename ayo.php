<?php
		/**
		 * @license
		 * ayo.php - v0.3.0
		 * Copyright (c) 2014, Alexandre Ayotte
		 *
		 * code is licensed under the MIT License.
		 * http://www.opensource.org/licenses/MIT
		*/
		// ayo.php
		// 2015-02-21 = La base
		// 2016-05-11 ...preconfig.php = code commun avec index.php
		// ayo2.php
		// 2016-09-11 rewrite plus secure
		// grace à: http://blog.teamtreehouse.com/how-to-create-bulletproof-sessions
		// 
		//testing temps d'attente long : sleep(2);
		
		ob_start();

		ini_set('display_errors', 1);
		error_reporting(E_ERROR | E_PARSE);

		$LOGFILENAME = "ayolog";


		include_once "__serv.php";

		include_once $HEREorTHERE.'preconfig.php';

		//-------definition globale custom
		$config = array();
		include_once 'app/config.php' ;


		function avertEtMAIL( $mess, $u=null, $m=null ) {
			global $app_domainname;

				$entete = "From: robot@".$app_domainname."\n\r";
				$cnt = $m."\n";
				$cnt .= "SERVER['HTTP_USER_AGENT']: ".$_SERVER['HTTP_USER_AGENT']."\n";
				$cnt .= "SERVER['REMOTE_ADDR']:     ".$_SERVER['REMOTE_ADDR']."\n";
				@mail( 'aa@cyberlude.com', $mess.' >> '.$app_domainname." ($u)", $cnt, $entete );

			print2log( $mess, $u, $m );
		}
		function avertir( $mess, $u='', $m='' ) {
			print2log( $mess, $u, $m );
		}
	
		//2018-07-30 simplier app_versionning/reloading
		$current_app_version =  configORdefault( 'app_version', 'v2016sept13' );
		

		//2017-02-01
		$user_info_keys =  configORdefault( 'session_keeps_those', array( 'email', 'pseudo', 'level' ) );
		$app_domainname =  configORdefault( 'app_domainname', 'cyberlude.ca' );
		$empty_traces_session =  configORdefault( 'empty_traces_session', false ); ////$app_domainname );
		
		$cookie_prefix =                             configORdefault( 'cookie_prefix',  'AJAXmyFRAMEWORK' );
		$db_dir =                          'app/'  . configORdefault( 'db_dir',    'db/' );

		$login_prefab = configORdefault( 'login_prefab', true );
		if ($login_prefab) {
			$login_script =      svp_paths( "libdbayo/" . configORdefault( 'login_script', 'req_login' ) .".php" );
		}
		else {
			$login_script =      svp_paths( $db_dir . configORdefault( 'login_script', 'req_login' ) .".php" );
		}
		
		$index_req_SQL_custom =  svp_paths( $db_dir . configORdefault( 'index_req_SQL_custom', 'index_req_SQL' ) .".php" );

		function acceptedDomain( $domain, &$domainList ){
			if (!is_array($domainList)) return false;
			foreach( $domainList as $domainItem ){
				if (strpos($domain, $domainItem)!==false) return true;
			}
			return false;
		}
		// cross-site acceptation!
		$REMO_OK = false;
		$remote_sites = configORdefault( 'accept_from_theses_sites', false );
		$http_srvorig = $_SERVER['HTTP_ORIGIN'];
		$srvorig = str_replace('https://', '', str_replace('http://', '', $http_srvorig));
		$host = $_SERVER['HTTP_HOST'];
		//vertir("host=[$host] === remote=[$srvorig] ?");
		if ($remote_sites && $http_srvorig && (($host != $srvorig))) { // pourquoi? $isONLINE &&     || (!$isONLINE)
			if (acceptedDomain( $srvorig, $remote_sites )) {
				header("Access-Control-Allow-Origin: $http_srvorig");
				//
				if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
					//Preflighted requests
					print2log("reflighted requests: Allow-Control-Allow-Origin: $http_srvorig [$srvorig]");
					//$hds = array();
					//foreach( $_SERVER as $sk => $sv ) $hds[] = "SERVER[$sk] = [$sv]\n";
					//vertir( "Xsite ACCEPTED:", $srvorig, implode( '', $hds ), true );
					//
			    	//header('Access-Control-Allow-Credentials: true');
			    	header('Access-Control-Max-Age: 60');    // cache for 1 day  = 86400
					//
		        	header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         
					// Access-Control headers are received during OPTIONS requests
				    //	if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
				    //    	header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         
				    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
						$acrh = $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'];
						$acrh = str_replace('[', '', str_replace(']', '', $acrh));
				        header("Access-Control-Allow-Headers: $acrh");
					}
			    	exit(0);
				}
				//ok! un acces remote accepté!
				$REMO_OK = true;
			}
			else {
				$hds = array();
				foreach( $_SERVER as $sk => $sv ) $hds[] = "SERVER[$sk] = [$sv]\n";
				avertEtMAIL( "Xsite REFUSED:", $srvorig, implode( '', $hds ), true );
				echo( '{ "ok":false, "error":"Xsite REFUSED:" }' );
		    	exit(0);
			}
		}


		$headers = getallheaders();

		$datasent = file_get_contents("php://input");
	
		$usr_id = '';
		
		$json = array();
		/////if ($headers["Content-Type"] == "application/json") 
		if (strpos( $headers["Content-Type"], "application/json")!==false) {
			//print2log( "datasent", $datasent );
			
			if (strpos( $datasent, '%%00%%00%%') > 1) {
				$lst = explode( '%%00%%00%%', $datasent );
			}
			else {
				$lst = array("SESSYOJSONerror", "BAD");
				//preg_split( "/\R/", $datasent );
			}
			
			if ($isCHATBOT) {
				$lst = array( '0', $datasent ); //simplification, pas de session
				$REMO_OK = true; //for testing, will be necessary true in production
			}
			
			$SESSYOID = trim($lst[0]);
			$SESSYOINFO = array();

			//vertir( "SESSYOID: [$SESSYOID] remo($srvorig)" );
			if ($REMO_OK) {
				$decoded = trim( $lst[1] );
				//print2log( "ACTION decoded: ", $decoded );
				$coquille = json_decode( $decoded, true );
				//print2log( "coquille[0]: ", $coquille[0] );
				$json = $coquille[1];
				//
				//if ($isCHATBOT) print2log( "--- remo($srvorig) CHATBOT is_array(json) ? ". (is_array($json) ? 'YES' : 'Oops') );
			}
			elseif (readSESSYO( $SESSYOID, $SESSYOINFO )) {
				//print2log( "SESSYOINFO :" );
				//foreach ($SESSYOINFO as $name => $value) {
				//	if ($value) print2log( $name, ' = ', $value );
				//}
				//print2log( "***" );
				
				$AYLPHA = $SESSYOINFO['aylpha']; //pour décoder la suite!
				$usr_id = $SESSYOINFO['usr_id'];
				//print2log( "AYLPHA: ",   $AYLPHA );
				//print2log( "session_usr_id: ",   $usr_id );

				$decoded = trim( $lst[1] );
				//print2log( "ACTION decoded: ", $decoded );
				$coquille = json_decode( $decoded, true );
				//aaon2obj( $decoded );
				//print2log( "coquille[0]: ", $coquille[0] );
				
				$yo_oldsess = explode( ':', $coquille[0] );
				//print2log( "yo_oldsess[0]: ", $yo_oldsess[0] );
				//print2log( "yo_oldsess[1]: ", $yo_oldsess[1] );

				if ($yo_oldsess[0] == 'YO') {
					//
					//verifier ancienne SESSYOID donnée en YO!!
					$OLDSESSYOID = $yo_oldsess[1];
					if ($OLDSESSYOID) {
						//print2log( "OLDSESSYOID: ", $OLDSESSYOID );
						$OLDSESSYOINFO = array();
						if (readSESSYO( $OLDSESSYOID, $OLDSESSYOINFO )) {
							//print2log( $OLDSESSYOID, '-->', $SESSYOID );
							if (($erracc = acceptableFollowupSESSYO( $OLDSESSYOINFO, $SESSYOINFO )) > 0) {
								//print2log( "YES!!! l'ancienne session se poursuit, mais sous un nouveau numéro");
							}
							else {
								print2log( 'erracc -->', $erracc );
							}
						}
						else {
							print2log( 'Can\'t read old session file:', $OLDSESSYOID );
						}
					}
				}
				else {
					//print2log( 'Current session file IS GOOD' );
				}
				
				$json = $coquille[1];
				//print2log( "--- is_array(json) : ". is_array($json) );
			}
			else {
				$messerr = "can't load current session file: $SESSYOID";
				print2log( $messerr );
				//
				//  erreur majeure... non?
				//
			}

		} 
		else {
			print2log("Bad headers[Content-Type]=".$headers["Content-Type"]);
		}
		//on est certain que json est un array ici...

		
		
		//pas ici, chaque truc le fait... NON ici... ou selon variable?
		$LOGFILENAME = "log_$SESSYOID";
		if ($empty_traces_session && (!$isCHATBOT)) {
			$empty_fh_please = $empty_traces_session;
			if ($fh) fclose($fh);
			$fh = null;
		}
		
	
		$data_to_send = array();

		$donttrustanymore = true;
		$qty = count( $json );
		$noreq = 0;


		if ($qty > 0) {

			$index_req_SQL = null;
			$cancel_remaining_requests = false;

			include svp_paths( "libdbayo/index_req_SQL.php" );

			if (!is_array($index_req_SQL)) {
				$index_req_SQL = array( "bidon"=>array("null") );
				$error = 'error pre-init catalog SQL';
				avertir( "error", $usr_id, $error );
			}
			
			//--------[
			//2016 sept 18: 
			//    déplacé au début i.e. ici, pour permettre login custom 
			//    MAIS le nom du login_script est hard_coded au tout debut tout en haut
			//    et on a une config pour permettre notre login custom, 
			//    DONC, la seule utilité de le placer ici est pour la validation de la liste
			//
			//load catalog CUSTOM des requetes
			//
			// * * *
			include $index_req_SQL_custom ; // * * *
			// * * *

			if (!is_array($index_req_SQL)) {
				$cancel_remaining_requests = true;
				$error = 'error init catalog SQL';
				avertir( "error", $usr_id, $error );
			}
			///// -----]





			// FAIRE LE TRI
			//
			$normalreq = array();
			$logoutreq = array();
			$loginreq = array();
			
			if (! $cancel_remaining_requests) {
				if ($REMO_OK) {
					$usr_id = '';
					$usr_level = 0;
					// que normal requests pour remote
					foreach ($json as $req_id => $one_request) {
						$act = $one_request['act'];
						if (($act=='LOG') || ($act=='OUT')) continue;
						$normalreq[$req_id] = $one_request;
					}
				}
				else foreach ($json as $req_id => $one_request) {
					$act = $one_request['act'];
					if ($act=='LOG') $loginreq[$req_id] = $one_request;
					elseif ($act=='OUT') $logoutreq[$req_id] = $one_request;
					else $normalreq[$req_id] = $one_request;
				}
			}



			$logout_done = false;
			if (count($logoutreq)>0) {
				foreach ($logoutreq as $req_id => $one_request) {
					$dataReturned = array();
					$error = 0;
					if ($logout_done) {
						$ok = 'error';
						$error = 'too many LOGOUT requests';
					}
					else {
						$ssem = $SESSYOINFO['email'];
						//avertir( "out!!!", "$usr_id ($ssem)", $ssem,  true );

						$usr_id = '';
						disloginSESSYO( $SESSYOID, $SESSYOINFO );		
						$usr_level = 0;
									
						$ok = 'ok';
						$logout_done = true;
					}
					if ($ok == 'ok') $noreq += 1;
					$data_to_send[$req_id] = array( 'ok'=>$ok, 'error'=>$error, 'dataReturned'=>$dataReturned );
				}
				//agir pour chacune...
				//1ere = ok, les autres error
			}


			$login_done = false;
			if (count($loginreq)>0) {
				//agir pour chacune...
				//1ere = ok, les autres error
				foreach ($loginreq as $req_id => $one_request) {
					$dataReturned = array();
					$error = 0;
					if ($logout_done) {
						$ok = 'error';
						$error = 'Logout was requested in the same series, logout take precedence';
					}
					elseif ($login_done) {
						$ok = 'error';
						$error = 'following LOGIN requests are ignored';
					}
					else {
						$data = $one_request['data'];
						$usr_id = '';
						//
						// * * *
						//vertir( "invoquer LOGIN SCRIPT : ",$login_script );
						include $login_script ; // * * *   $data['email'] ,   $data['mtpss'] 
						// * * *
						//

						if ($usr_id == '') {
							$ok = 'error';
							$error = 'Bad login info with '.$data['email'];
							
							$usr_level = 0;
							disloginSESSYO( $SESSYOID, $SESSYOINFO );					
							//vertir( "error log", $data['email'], $data['mtpss'], true );
						}
						else {
							$donttrustanymore = false;
							//<<<<<OK>>>>>>
							$user_information = $dataReturned;
							$ok = 'ok';
							
							$usr_level = $user_information['level'];
							$SESSYOINFO['usr_id'] = $usr_id;
							loginSESSYO( $SESSYOID, $SESSYOINFO, $user_information, true );
							$ssem = "[$usr_level] ".$data['email'];
							//avertir( "LOGIN OK", $usr_id.$ssem , $ssem, true );
						}

						$login_done = true;
					}
					if ($ok == 'ok') $noreq += 1;
					$data_to_send[$req_id] = array( 'ok'=>$ok, 'error'=>$error, 'dataReturned'=>$dataReturned );
				}
			}
			
			//function pour les sous-requetes "externes" qu'on va appeller ci-dessous.
			//celles qui sont "sensibles" pourront exiger un mtpss pour revalider l'id
			//elles vont affecter la SESSYO et doivent appeller le login_script
			function mustChekcAgainPassword( $mtpssAgain ){
				global $SESSYOID, $SESSYOINFO, $donttrustanymore, $usr_id, $usr_level;
				
				$data['mtpss'] = $mtpssAgain;
				$usr_id_to_reverify = $SESSYOINFO[ 'id' ];
				$usr_id = '';
				// * * *
				//
				//vertir( "invoquer LOGIN SCRIPT : ",$login_script );
				include $login_script ; // * * *   $data['email'] ,   $data['mtpss'] 
				// * * *
				//
				if ($usr_id == '') {
					$donttrustanymore = true;
					$error = 'Bad verify again for '.$usr_id_to_reverify;
					//vertir( "error verify again", $usr_id_to_reverify, $mtpssAgain, true );
					//
					return false;
				}

				$donttrustanymore = false; //its ok
				$user_information = $dataReturned;
				$ok = 'ok';
				
				//?? $usr_level = $user_information['level'];
				//<<<<<OK>>>>>>
				$SESSYOINFO['usr_id'] = $usr_id;
				loginSESSYO( $SESSYOID, $SESSYOINFO, null, false );
				avertir( "VERIFY AGAIN OK", $data['email'], "*****", true );
				//
				return true;
			}
			
			

			if ((!$logout_done) && (!$login_done) && (!$isDIALOGUE)) {
				//
				//
				/* est-ce utile? OUI!! très utile : pour HLO!!!      mais pas ça:   'usr_id'=>'',   */
				$user_information = array();
				foreach( $user_info_keys as $k ) {
					$user_information[ $k ] = $SESSYOINFO[ $k ];
				}
				//*/
				
				//établir un niveau de sécurité
				// --0-- personne inconnue, pas connectée
				//DEJA FAIT:  ??  
				$usr_id = $SESSYOINFO['usr_id'];
				$usr_level = $SESSYOINFO['level'];
				// --1-- personne connectée mais depuis "trop" longtemps
				//( ($SESSYOINFO['timeofdoubt']+0) < time() );
				// --2-- presonne connectée récemment
				//
				//c'est la responsabilité des autres requetes, ci-dessous, de vérifier si elles font confiance aux info de l'usager
				//
			}

			
			
			//agir pour chacune des requetes normales
			//
			if (count($normalreq)>0) {

				//$usr_level = $user_information['level'];

				foreach ($normalreq as $req_id => $one_request) {
					$dataReturned = array();
					$error = 0;

					$act = $one_request['act'];
					if ($cancel_remaining_requests) {
						$ok = 'cancel';
						//
					}
					elseif ($act == 'HLO') {
						$dataReturned = $user_information;
						//print2log( "just checking!", $user_information['email'], $user_information['level'], false );
						$ok = 'ok';
					}
					else {
						if (array_key_exists( $act, $index_req_SQL )) {
							$sql_record = $index_req_SQL[$act];
							$level_required = $sql_record['level'];
						}
						else {
							$ok = 'error';
							$error = 'unkown SQL request : act=['.$act.'], '.KeyVal2String("one_request",$one_request);
							avertir( "error", $usr_id, $error );
							$level_required = -999;
						}

						if (($level_required==0) || ($isCHATBOT) || (($level_required>0) && ($usr_level >= $level_required))) {
							$data = $one_request['data'];
							$sql_php = $sql_record['file'];

							$prefab = $sql_record['prefab'];
							if ($prefab) 
								$fullreqpath = svp_paths( 'libdbayo/'.$sql_php.'.php' );
							else 
								$fullreqpath = svp_paths( $db_dir.$sql_php.'.php' );

							//
							//
							//vertir( "ayo.php (load req DB external)!", $fullreqpath );
							// 
							//
							// * * *
							include $fullreqpath ; // * * *
							// * * *
							//
							$rollback = $dataReturned['rollback'];
							if ($ok && $rollback) {
								print2log( "query   :", $dataReturned['query'] );
								print2log( "rollback:", $rollback, "USAGER: $usr_id" );
								$dataReturned['rollback']=null;
								$dataReturned['query']=null;
							}
							//
							//vertir( "data_to_send.count()", count($data_to_send) );
						}
						else {
							$ok = 'error';
							if (!$error) $error = "level too low: (usr: $usr_level VS page: $level_required for $act)";
							//$level_required = -999;
						}

					}
					if ($ok == 'ok') $noreq += 1;
					$data_to_send[$req_id] = array( 'ok'=>$ok, 'error'=>$error, 'dataReturned'=>$dataReturned );
				}
			}
		}
		else {
			//print2log("AYO received no requests");
		}


		//tout en bas ici, au cas où des requetes auraient revalidé le timeofdoubt
		$now = time();
		if ($isCHATBOT) {
			$timeBeforeLoosingTrust = 0;
			$donttrustanymore = false;
			$usr_id = "ChatBot";
			$usr_level = 1;

			$returnedJSON = array(
				"is_connected"		=>($usr_id != '') ? true : false ,
				"dataReceived"		=> $data_to_send,
			);

		}
		else {
			$timeBeforeLoosingTrust = ( ($SESSYOINFO['timeofdoubt']+0) - $now );
			$donttrustanymore = ( $timeBeforeLoosingTrust <= 0 );

			$returnedJSON = array(
				"is_connected"		=>	($usr_id != '') ? true : false ,
				"is_trusted"        =>  (! $donttrustanymore) ? true : false,
				"userLevel"         => $usr_level,
				"timeLeftTrusted"   => $timeBeforeLoosingTrust,
				"timeNow"           => $now,
				"startedAT"         => $startedAT,
				"dataReceived"		=> $data_to_send,
				'version_app'		=> $current_version_paths, ///new!! à chaque retour, on peut vérifier si les différents dossiers ont changé
				'new_app_version'   => $current_app_version,
				'done'				=> "$noreq / $qty"
			);

		}


		//$ob_written = ob_get_length();
		//if ($ob_written > 0) print2log("ERREUR * * * * un script essaie d'envoyer du stock au browser * * * * ");
		ob_end_clean();
		
		//print2log( "returnedJSON[is_connected]=".$returnedJSON['is_connected'] );
		//print2log( "returnedJSON[is_trusted]=".$returnedJSON['is_trusted'] );
		//print2log( "returnedJSON[userLevel]=".$returnedJSON['userLevel'] );

		$asJSON = json_encode( $returnedJSON );
		///BAD!!! $asJSON = json_encode( $returnedJSON, JSON_PRESERVE_ZERO_FRACTION | JSON_NUMERIC_CHECK );
		
		if (($asJSON === false) || ($asJSON == '') || ($asJSON == null)) {
			
			//print2log( print_r( $data_to_send, true ) );
			print2log( "**=======================**" );
			print2log( "json_last_error = ".json_last_error()." --> ".json_last_error_msg() );
			
			$data_cleaned = array();
			foreach($data_to_send as $req_id => $results) {
				$records = $results['dataReturned']['records'];
				if (is_array($records)) {
					foreach( $records as $rec ) {
						if (json_encode($rec) === false) {
							print2log("---------------------");
							print2log( print_r( $rec, true ) );
							print2log( "********* json_last_error = ".json_last_error()." --> ".json_last_error_msg() );
						}
					}
				}
				$data_cleaned[ $req_id ] = array( "ok"=>false, "error"=>"json_encode(failed)" );
			}
			$returnedJSON['dataReceived'] = $data_cleaned;
			
			$asJSON = json_encode( $returnedJSON );
			///BAD!!! $asJSON = json_encode( $returnedJSON, JSON_PRESERVE_ZERO_FRACTION | JSON_NUMERIC_CHECK );

			if (($asJSON === false) || ($asJSON == '') || ($asJSON == null)) {
				$asJSON = '{"error":"json_encode(failed)"}';
			}
		}

		
		//-------on retourne QUE du JSON
		header("Content-type: application/json;");

		
		// on veut faire du traitement en solo/background, après avoir dit au Browser que tout est envoyé
		if (isset($AYO_please_do_it_after_connection_closed)) {
			set_time_limit( 0 );
			ignore_user_abort(true);
			
			ob_start();
			
			echo( $asJSON );
			
			// Figure the size of our content
			$size = ob_get_length();
			
			// And send the content-length header
			header("Content-Length: $size");
			header('Connection: close');

			// Now flush all of our output buffers
			ob_flush();
			$ok_end_flush = ob_end_flush();
			flush();
			
			if (! $ok_end_flush) print2log("could not properly flush ob_end_flush buffers...");
			
			call_user_func( $AYO_please_do_it_after_connection_closed );
		}
		else {
			//juste send and be happy, as before
			echo( $asJSON );		
		}
			

?>