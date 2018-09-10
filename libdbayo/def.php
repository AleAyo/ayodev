<?php
	//
	/**
	 * @license
	 * def.php - v0.1
	 * Copyright (c) 2012, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/
	if ($isONLINE) error_reporting(0);
	ini_set('display_errors', 1);
	error_reporting(E_ERROR | E_PARSE);
	
	$SQLhost = $_SERVER["HTTP_HOST"];
	$PHP_SELF = $_SERVER["PHP_SELF"];
	$REMOTE_ADDR = $_SERVER["REMOTE_ADDR"];

	$DATE = '25 juillet 2017'; //history  '20 juin 2014'  '13 juin 2012';

	$trackEachQueryIntoLogFile=0;
	
	$withDBpersistent = true;
	$DB_LNK = null;

	/*==
	== ici config particulière au serveur d'hebergement
	==
	*/
	include_once '__serv.php' ;
	/*==
	*/

	/*-------------------------------------------------------- 
        	DB basic access 
			25 juillet 2017 : passage à MySQL(i)_ ...procedural :-/
			+ option Presistent
	-------------------------------------------------------- */


	function db_connect() {
		global $DB_LNK,$APPAYO_host,$APPAYO_user,$APPAYO_mpss,$APPAYO_db,$DBcharset;
		if ($DB_LNK) {
			return TRUE;
		}
		if ($APPAYO_host == "localhost") $APPAYO_host = "127.0.0.1";
		
		//printerr( "MySQL(i) trying to connect!" );
		//if ($withDBpersistent) $APPAYO_host = "p:$APPAYO_host";

		$DB_LNK = mysqli_connect( $APPAYO_host, $APPAYO_user, $APPAYO_mpss,  $APPAYO_db );
		if (($errno = mysqli_connect_errno($DB_LNK)) == 0) {
			mysqli_set_charset( $DB_LNK, 'utf8' );
			$DBcharset = mysqli_character_set_name($DB_LNK);
			//printerr( "MySQL(i) DBcharset=[$DBcharset]" );
			//
			return TRUE;
		}
		printerr( "MySQL(i) can't connect? ERROR: $errno : ".mysqli_connect_error($DB_LNK) ); 
		$DB_LNK = null;
		return FALSE;
	}
	
	function db_query_prepOnly($q) {
		global $DB_LNK;
		if (!$DB_LNK) return 'nolink:UNAFFECTED:'.$q;
		//
		$qe = mysqli_real_escape_string( $DB_LNK, $q );
		$qef = str_replace("`", "'", $qe); 
		return $qef;
	}

	function db_query($q) {
		global $DB_LNK, $LAST_REQ, $LAST_QTY,$trackEachQueryIntoLogFile, $LASTERR, $SQLERROR;
		//printerr("a");
		if (!$DB_LNK) return FALSE;
		if (!$q) return FALSE;
		//
		$qe = mysqli_real_escape_string( $DB_LNK, $q );
		
		$qef = str_replace("`", "'", $qe); 
		//-------il faut que les requetes soient DÉJÀ codées avec l'accent aigu!!!! <WARNING>
		//
		$r = mysqli_query( $DB_LNK, $qef );
		
		$LAST_REQ = $qef;
		$LASTERR = ($ern = mysqli_errno($DB_LNK))? $ern.'='.mysqli_error($DB_LNK) : '';
		$SQLERROR = $LASTERR;
		//
		//DEBOG-----------
		if ($trackEachQueryIntoLogFile) printerr($qef); 
		if ($r===false) { 
			if (!$trackEachQueryIntoLogFile) printerr($qef); 
			printerr( $LASTERR );
		}
		//----------------
		return $r;
	}
	function db_affected_rows( $r=null ) {
		global $DB_LNK;
		if (!$DB_LNK) return 0;//'nolink:affected=0';
		return mysqli_affected_rows( $DB_LNK );
	}
	function db_query_2_array( $q ) {
		global $DB_LNK, $trackEachQueryIntoLogFile;
		global $SQLERROR, $LASTERR;
		//$trackEachQueryIntoLogFile = 1;
		//
		db_connect();
		$r = db_query( $q );
		$arr = array();
		if ($r) {
			unset($SQLERROR);unset($LASTERR);
			while ( $DETAIL = mysqli_fetch_array( $r, MYSQLI_ASSOC ) ) {
				$arr[] = $DETAIL;
			}
		}
		else {
			$LASTERR = ($ern = mysqli_errno($DB_LNK))? $ern.'='.mysqli_error($DB_LNK) : '';
		}
		return $arr;
	}
	
	
	//////////
	//2018 many queries in batch processing
	//     IDEAL pour les insert / update : pas de gros result set...
	//
	function db_batch_queries( $manyq ) {
		global $DB_LNK, $LAST_REQ, $LAST_QTY,$trackEachQueryIntoLogFile, $LASTERR, $SQLERROR;
		//
		if (!$DB_LNK) return 0;//'nolink:affected=0';
		if (!$manyq) return FALSE;
		//
		$qe = mysqli_real_escape_string( $DB_LNK, $manyq );
		$qef = str_replace("`", "'", $qe); 
		//printerr( $qef );
		//
		if ( mysqli_multi_query( $DB_LNK, $qef ) ) {
			$arr = array();
			//printerr( "BATCH OK?");
			do {
				/* premier résultat */
				$result = mysqli_store_result($DB_LNK);
				$err = mysqli_error($DB_LNK);
				if (0) {
					$arr[] = "OK";
				}
				else {
					$arr[] = "ERR: ".mysqli_errno($DB_LNK);
				}
				////* Affichage d'une séparation */
				///if (mysqli_more_results($DB_LNK)) {
				///   printf("-----------------\n");
				///}
			} 
			while ( mysqli_next_result( $DB_LNK ) );
			//
			return $arr;
		}
		$LAST_REQ = $qef;
		$LASTERR = ($ern = mysqli_errno($DB_LNK))? $ern.'='.mysqli_error($DB_LNK) : '';
		printerr( $LASTERR );
		//
		$SQLERROR = $LASTERR;
		return 0;
	}
	//////////
	
	
	function db_fetch_assoc( $RESULTS ) {
		global $DB_LNK;
		if (!$DB_LNK) return null;
		return mysqli_fetch_array( $RESULTS, MYSQLI_ASSOC );
	}
	function db_fetch_array( $RESULTS ) {
		global $DB_LNK;
		if (!$DB_LNK) return null;
		return mysqli_fetch_array( $RESULTS, MYSQLI_NUM );
	}

	function db_error() {
		global $DB_LNK, $LASTERR;
		if ($DB_LNK) return ($LASTERR = ($ern = mysqli_errno($DB_LNK))? $ern.'='.mysqli_error($DB_LNK) : '');
		//
		return "No MySQLi connection initialised yet";
	}


	function db_close() {
		global $DB_LNK;
		if ($DB_LNK) mysqli_close( $DB_LNK );
		$DB_LNK = 0;
	}




	/*-------------------------------------------------------- 
        	DATE HEURE et SEC MILLISEC 
	-------------------------------------------------------- */

	function millisec() {
	    list($usec, $sec) = explode(" ", microtime()); 
	    $now = round( (float)$usec * 1000 );
		return $now;
	}

	function microseconds( $futurEnMilli=0 ) {
	    list($usec, $sec) = explode(" ", microtime()); 
	    $now = ((float)$usec + (float)$sec);
		return $now + ($futurEnMilli/1000);
	}


	$moisEnglish = array('January','February','March','April','May','June','July','August','September','October','November','December');

	$moisEnFrancais = array('','janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre');
	function belleDate($d) {
		if (!$d) $d = date("Y-m-d");
		global $moisEnFrancais;
		$parts = explode("-", $d);
		return $parts[2] .' '. $moisEnFrancais[ intval($parts[1]) ] .' '.  $parts[0]; //." ($d)";
	}
	function belleJourhre($d) {
		if (!$d) $d = date("Y-m-d G:i:s");
		$parts = explode(" ", $d);
		//
		$dt = belleDate($parts[0]);
		if (count($parts)>1) $hr = ' à '.$parts[1]; else $hr='';
		return $dt . $hr;
	}

	function sqlDate() {
		return date("Y-m-d G:i:s");
	}
	
	
	
	/*-------------------------------------------------------- 
        	ERRORS LOGS + SOME TRACKS 
	-------------------------------------------------------- */

	function printerr( $mess ) {
		global $fh;
		if (!$fh) {
			$myFile="log/log.php";
			$fh=fopen($myFile, 'a'); // or die("can't open file");
			if (!$fh) {
				echo "####### ERR ACCES LOG.PHP #######";
				return;
				}//-----------------------------------------------> return

			$d=sqlDate();
			fwrite($fh, "\n".$d ." ..................\n");
		}
		fwrite($fh, $mess ."\n");
		//fclose($fh);		
	}
	function tracks( $mess ) {
		$myFile="log/tracks.php";
		$fh = fopen($myFile, 'a'); // or die("can't open file");
		if (!$fh) return;//-----------------------------------------------> return

		$d=sqlDate();
		fwrite($fh, $d ."\t". $mess ."\n");
		fclose($fh);		
	}


	/*-------------------------------------------------------- 
	//		2015 aout 27 -- nouveau systeme commun de tracking usager
	// 		pensé pour ne générer qu'une entrée par appel de PHP, pour jeuxpolygone entre autres...
	// 		ou uiliser la fonction _now() si besoin inscrire plusieurs lignes dans le même GET/POST
	-------------------------------------------------------- */
	unset($ZLING_code);
	
	function zling( $code, $subcode, $id, $data ) {
		global $ZLING_code, $ZLING_subcode, $ZLING_id, $ZLING_data;
		$ZLING_code = $code; $ZLING_subcode = $subcode; $ZLING_id = $id; $ZLING_data = $data;
	}
	function zling_once() {
		global $ZLING_code, $ZLING_subcode, $ZLING_id, $ZLING_data;
		if (!isset($ZLING_code)) return;
		//
		$ZLING_data = strip_tags( $ZLING_data );
		$ZLING_data = str_replace( "`", "°", $ZLING_data );
		//
		$q = 'INSERT INTO zling (code, subcode, id,  machine_ip,  data,   jourhre) VALUES ( ';
		$q .= "`". $ZLING_code . "`,";
		$q .= "`". $ZLING_subcode . "`,";
		$q .= "`". $ZLING_id . "`,";
		$q .= "`". $_SERVER["REMOTE_ADDR"] . "`,";
		$q .= "`". $ZLING_data . "`,";

		$q .= "NOW()";
		$q .= " )";

		//global $trackEachQueryIntoLogFile;
		//$trackEachQueryIntoLogFile = 1;

		db_connect();
		$res = db_query( $q );
		
		unset($ZLING_code); //only once!! really!!
	}
	function zling_now( $code, $subcode, $id, $data ) {
		zling( $code, $subcode, $id, $data );
		zling_once();
	}





	/*-------------------------------------------------------- 
        	ARRAY et STRINGS 
	-------------------------------------------------------- */


	//===2012 juin 13 : pas besoin que ce soit autant "sécure" : j'aimerais avoir moyen de récrypter un mtpss en DB
	function cryptaa( $t ) {
		return strrev( base64_encode($t) );
	}
	function uncryptaa( $ct ) {
		return base64_decode( strrev( $ct ) );
	}



	function array_k( $needle, $haystack ) {
		$t = count($haystack);
		for($i=0;$i<$t;$i++) if ($needle == $haystack[$i]) return $i;
		return -1;
	}
	function Arr2Str( $arr ) {
		if (is_array($arr)) { 
			$o=''; $sp=''; 
			foreach ($arr as $em) { $o .= $sp . Arr2Str($em); $sp=',';} 
			return $o; ////'('.$o.')';
		}
		return $arr;
	}
	function KeyVal2Str( $ky, $arr ) {
		if (is_array($arr)) { 
			$o=''; $sp=''; 
			foreach ($arr as $ky2 => $em) { $o .= $sp . KeyVal2Str($ky2, $em); $sp=', '; } 
			return $o;
		}
		return $ky."=".$arr;
	}


	function arr_dump_pre( $varname, $arr ) { print $varname.'<pre>'; arr_dump($arr); print '</pre>'; }

	function arr_dump( $arr, $level='  ') {
		if (is_array($arr)) {
			printerr( "\n");
			$keys = array_keys($arr);
			foreach( $keys as $ky ) {
				//if (!is_string($ky)) continue;
				$val = $arr[$ky];
				$ky = str_pad('['.$ky.']',20);
				printerr( "$level $ky = |");
				arr_dump($val, $level.$level);
				printerr( "|\n");
			}
			printerr( "    ....");
		}
		else printerr( $arr);
	}


	$ACCENTS = array('Š','Œ','Ž','š','œ','ž','Ÿ','¥','µ','À','Á','Â','Ã','Ä','Å','Æ','Ç','È','É','Ê','Ë','Ì','Í','Î','Ï','Ð','Ñ','Ò','Ó','Ô','Õ','Ö','Ø','Ù','Ú','Û','Ü','Ý','ß','à','á','â','ã','ä','å','æ','ç','è','é','ê','ë','ì','í','î','ï','ð','ñ','ò','ó','ô','õ','ö','ø','ù','ú','û','ü','ý','ÿ','€','£');
	$PLAINS = array('S','O','Z','s','o','z','Y','(Yen)','u','A','A','A','A','A','A','A','C','E','E','E','E','I','I','I','I','D','N','O','O','O','O','O','O','U','U','U','U','Y','s','a','a','a','a','a','a','a','c','e','e','e','e','i','i','i','i','o','n','o','o','o','o','o','o','u','u','u','u','y','y','(Euro)','(Lb)');
	function toASCII( $str ) {
		global $ACCENTS, $PLAINS;
		$str2 = str_replace( $ACCENTS, $PLAINS, $str );
		return $str2;
	}





	function page_redirect_and_exit( $goto ) {
		print '<HTML><HEAD><META HTTP-EQUIV="Refresh" CONTENT="0; URL='.$goto.'"></HEAD></HTML>';
		exit(0);
	}


?>