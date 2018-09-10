<?php
	//
	// preconfig.php
	// 2016-05-11
	// (c) Alexandre Ayotte 
	//
	ini_set('display_errors', 1);
	error_reporting(E_ERROR | E_PARSE);
	
	$fh = null;
	$empty_fh_please = false;
	function print2log( $mess,$b='',$c='',$d='' ) {
		global $fh, $empty_fh_please, $LOGFILENAME, $LOGSUBDIR;
		if (!$LOGFILENAME) $LOGFILENAME = 'ayolog';
		if (!$fh) {
			if (isset($LOGSUBDIR)) {
				$myPath = "log/$LOGSUBDIR/";
				mkdir( $myPath, 0777 );
			}
			else {
				$myPath = "log/";
			}
			$myFile = $myPath.$LOGFILENAME.".php";
			if ($empty_fh_please) {
				$fh=fopen($myFile, 'w'); // or die("can't open file");
				if (!$fh) return;//-----------------------------------------------> return
				//$myPath2 = "log/$LOGSUBDIR/";
				fwrite($fh, "<?php /*---- $empty_fh_please ... [$myPath] \n");
				$empty_fh_please = false;
			}
			else {
				$fh=fopen($myFile, 'a'); // or die("can't open file");
				if (!$fh) return;//-----------------------------------------------> return
			}

			$ddd = date("Y-m-d G:i:s");
			fwrite($fh, "\n".$ddd ." ..................\n");
		}
		if (isset($b)) $mess .= " $b";
		if (isset($c)) $mess .= " $c";
		if (isset($d)) $mess .= " $d";
		fwrite($fh, $mess ."\n");
		//fclose($fh);		
	}
	function KeyVal2String( $ky, $arr ) {
		if (is_array($arr)) { 
			$o=''; $sp=''; 
			foreach ($arr as $ky2 => $em) { $o .= $sp . KeyVal2String($ky2, $em); $sp=', '; } 
			return $o;
		}
		return $ky."=".$arr;
	}
	
	
	//////SESSYO////////////////////////
	$AAZERO = "A";
	$AALPHA = "23456789BCDEFGHJKLMNPQRSTUVWXYZ";
	$AASEP = "|";
	$AYLPHA = '';//à générer ci-dessous
	$SESSPERMKEYS = array("aylpha", "jourhre", "sessyo", 'oldss', "agent", "timestarted", "timeoflogin", "timeofdoubt", "referer" );
	
	$TIMETRUSTED = (15 * 60); // en secondes
	$startedAT = microtime(true);
	
	
	function informjsSESSYO( $newssesyoid=null ) {
		global $AALPHA, $AAZERO, $AASEP, $AYLPHA, $startedAT;
		//on cree la nouvelle session, on cree le fichier, on cree le nouvel AALPHA
		//on écrit ça en JS, et voilà. ....on attends AJAX (ayo.js) pour reprendre l'ancienne session (ou non)
		if ($newssesyoid == null) {
			$t = time();
			$newssesyoid = $t.'_'.rand(10,99).rand(10,99).rand(10,99).rand(10,99).rand(10,99);
			$aa = str_split( $AALPHA );
			shuffle($aa);
			$aa = implode('',$aa);
			//print "/*\n $AALPHA \n $aa\n*/\n";
			$AYLPHA = $AAZERO.$aa;
			$newsess = array(
				"aylpha"=>$AYLPHA,
				"jourhre"=>date("Y-m-d G:i:s"),
				"sessyo"=>$newssesyoid,
				"agent"=>$_SERVER['HTTP_USER_AGENT'],
				"oldss"=>'',
				"usr_id"=>'',
				"safelylog"=>0,
				"timestarted"=>$startedAT,
				"timeoflogin"=>'', //when (time())
				"timeofdoubt"=>'',
				"level"=>0,
				"referer"=>$_SERVER['HTTP_REFERER']
			);
			writeSESSYO( $newssesyoid, $newsess );
		}

		$AALPHA = $AAZERO.$AALPHA;
		print "var AALPHA='$AALPHA';\n";
		print "var AYLPHA='$AYLPHA';\n";
		print "var AAZERO='$AAZERO';\n";
		print "var AASEP='$AASEP';\n";
		print "var SESSYO='$newssesyoid';\n";
	}
	function loginSESSYO( $ssyoid, &$cursess, $infoToCopy=null, $firstTime=null ) {
		global $TIMETRUSTED;
		if (is_array($infoToCopy)) foreach($infoToCopy as $key => $val) {
			$cursess[$key] = $val;
		}
		//
		$t = time();
		if ($firstTime) $cursess['timeoflogin'] = $t;
		$cursess['timeofdoubt'] = $t + $TIMETRUSTED;
		return writeSESSYO( $ssyoid, $cursess );
	}
	function acceptableFollowupSESSYO( &$oldsess, &$cursess ){
		$ag1 = $oldsess['agent'];
		$ag2 = $cursess['agent'];
		if ($ag1 != $ag2) return -101;
		//
		//EN EFFET!!  methobulles a des usagers level=0 (unlogged)  if ($oldsess['level'] < 2) return -1001; /////////TRES DISCUTABLE CECI
		//
		$tin = $oldsess['timestarted']+0;
		if ($tin == 0) return -102;
		//
		global $TIMETRUSTED;
		$t = microtime(true);
		//print2log("now microtime(true)   ", $t);
		//print2log("old_sess . timestarted", $tin);
		//print2log("TIMETRUSTED, x3 =     ", $TIMETRUSTED, (3*$TIMETRUSTED) );
		//print2log("diff", ($tin + (3*$TIMETRUSTED)) - $t );
		if (($tin + (3*$TIMETRUSTED)) < $t) return -201;
		//
		$ssyoid = $cursess['sessyo'];
		global $SESSPERMKEYS;
		foreach($oldsess as $key => $val) {
			if (in_array( $key, $SESSPERMKEYS )) continue;
			$cursess[$key] = $val;
		}
		$cursess['oldss'] = $oldsess['sessyo'];
		if (writeSESSYO( $ssyoid, $cursess )) return 1;
		return -666;
	}
	function disloginSESSYO( $ssyoid, &$cursess ) {
		global $SESSPERMKEYS;
		foreach($cursess as $key => $val) {
			if (in_array( $key, $SESSPERMKEYS )) continue;
			$cursess[$key] = '';
		}
		$cursess['timeoflogin'] = 0;
		$cursess['timeofdoubt'] = 0;
		return writeSESSYO( $ssyoid, $cursess );
	}
	function writeSESSYO( $ssyoid, &$cursess ) {
		$p = "ssyo/$ssyoid.php";
		$fss = fopen($p, 'w'); // or die("can't open file");
		if (!$fss) {
			 //-----------------------------------------------> return
			return false;
		}
		$head = "<?php /*--\n";
		$text = '';
		foreach( $cursess as $key => $val ) {
			$text .= $key . "=" . $val . "\n";
		}
		fwrite( $fss, $head . $text );
		fclose($fss);
		return true;
	}
	function readSESSYO( $ssyoid, &$cursess ) {
		$p = "ssyo/$ssyoid.php";
		$dataread = file_get_contents( $p );
		if ($dataread === false) {
			//$record['error'] = 'probleme lecture fichier '.$p;
			return false;
		}
		else {
			$lst = preg_split("/\R/", $dataread);
			$one = true;
			foreach($lst as $itm) {
				if ($one) { $one=false; continue; }
				//
				$itm = trim($itm);
				//
				if (strlen($itm)>0) {
					$parts = explode("=", $itm);
					for( ; count($parts) < 2; $parts[]='');
					$cursess[ trim($parts[0]) ] = trim($parts[1]);
				}
			}
		}
		return true;
	}

	//===========================
	//
	function configORdefault( $key, $def=null ) {
		global $config;
		if (is_array($config) && array_key_exists($key, $config)) return $config[$key];
		return $def;
	}
	
	function svp_paths( $path ) {
		global $current_version_paths;
		$r=array();
		$p=explode('/', $path);
		$tot = count($p);
		for($i=0; $i<$tot; $i++) {
			$f = $p[$i];
			if (array_key_exists( $f, $current_version_paths )) { $f = $current_version_paths[$f]; }
			$r[] = $f;
		}
		$s = implode('/', $r);
		//print2log( $pathtofile.' --> '. $s );
		return $s;
	}

	function echo_svp( $pathtofile ) {
		echo svp_paths( $pathtofile );
	}
	
	//
	//  getting rid of REQUIREJS fuck!
	//
	function readJSfile( $p, &$lines ) {
		$p = svp_paths( $p );
		$dataread = file_get_contents( $p );
		if ($dataread === false) {
			$line[] = 'probleme lecture fichier '.$p;
			return false;
		}
		else {
			$lst = preg_split("/\R/", $dataread);
			$one = false;
			$two = false;
			foreach($lst as $itm) {
				if ((!$one) && (strpos($itm, "define(")===false)) continue;
				$one = true;
				////if ((!$two) && (strpos($itm, "function(")===false)) continue;
				if (!$two) {
					if (strpos($itm, "{")===false) continue;
					$itm = "function() {";
					$two = true;
				}
				if (strpos($itm, ")") === 0) break;
				$lines[] = $itm;
			}
		}
		return true;	
	}
	function embedBigExternalJS( $p ) {
		$p = svp_paths( $p );
		$dataread = file_get_contents( $p );
		if ($dataread === false) {
			return "console.warn('probleme embedBigExternalJS( $p );')";
		}
		return $dataread;
	}
	function embedOneJS( $varname, $path ){
		$lines = array();
		if (readJSfile( $path, $lines )) {
			return "\tvar $varname = ". implode( "\n", $lines )."();\n";
		}
		return "\nconsole.warn('ERROR embedOneJs(\"$varname\",\"$path\")');\n";
	}
	function embedManyJSandStartLast( $varnames, $pathstofiles ){
		$lines = array();
		//$varnames = explode(",", $varnamesstring);
		$tot = min(count($varnames), count($pathstofiles));
		$dern = "errorApp";
		for( $i=0; $i<$tot; $i++ ){
			$dern = trim($varnames[$i]);
			$lines[] = "<script type='text/javascript'><!--manyJS\n";
			$lines[] = embedOneJS( $dern, $pathstofiles[$i].".js" );
			$lines[] = "\n--></script>";
		}
		return implode( "\n", $lines )."\n\t".
			"<script type='text/javascript'><!--APP\n".
			"window.applicationStart = function() { ".$dern.".start(); }\n". 
			"\n--></script>\n";
	 	//"function applicationStart() { ".$dern.".start(); }\n";
	}
	
	
?>