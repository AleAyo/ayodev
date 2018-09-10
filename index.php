<?php
		/**
		 * @license
		 * index.php - v0.3.0
		 * Copyright (c) 2014, Alexandre Ayotte
		 *
		 * code is licensed under the MIT License.
		 * http://www.opensource.org/licenses/MIT
		 */

	
	// pour inadmin.php :
	if (!isset($whichConfig)) $whichConfig = 'config';
	if (!isset($whichHtmlBody)) $whichHtmlBody = 'appbody';
	
	include_once "__serv.php";
	
	include_once $HEREorTHERE."preconfig.php";
	
	include_once "app/$whichConfig.php";
	
	$ici = '';
	if (!$isONLINE) $ici=' LOCAL';
	if ($isDEVSITE) $ici=' DEV';
	
	function ieversion() {
		$reg = array();
		$match = preg_match('/MSIE ([0-9]+.[0-9]+)/',$_SERVER['HTTP_USER_AGENT'],$reg);
		if($match==0)
			return 6666;
		else
			return floatval($reg[1]);
	}
	
	$ie_minimal = configORdefault( 'ie_minimal', null );
	if (isset($ie_minimal)) {
		$ie_minimal = 1*$ie_minimal;
		$ie_current = ieversion();
		$ie_redirect_page = configORdefault( 'ie_redirect_page', null );
		if (isset($ie_redirect_page) && ($ie_current < $ie_minimal)) {
			print2log( "TOO OLD IE: ", $ie_current );
			include $ie_redirect_page;
			exit(0);
		}
	}
	
	$window_title = configORdefault( 'window_title', 'APP TITLE HERE' );
	$stylesheets = configORdefault( 'stylesheets', 0 );
	$cookie_prefix =     configORdefault( 'cookie_prefix', 'AYOKIT' );
	$app_version =  configORdefault( 'app_version', 'v2016sept13' );

	$ressource_site =  configORdefault( 'ressource_site', false );
	
	$with_empty_gate =  configORdefault( 'with_empty_gate', false );
	$with_LZstring =  configORdefault( 'with_LZstring', false );
	$outside_lib_scripts = configORdefault( 'outside_lib_scripts', false );

	$embedThoseJS = configORdefault( 'embedThoseJS', false );
	$embedTheseCSS = configORdefault( 'embedTheseCSS', false );
	
	if ($with_empty_gate === true) {
		include $HEREorTHERE."ayo_gate.php";
		if ($SESSYObyGATE === 0) {
			print2log( "FORM THE GATE -- ERROR SESSYOID: ", $SESSYObyGATE );
			include "indexgate.php";
			exit(0);
		}
	}
	else $SESSYObyGATE = null;
	
	$prepend_sql = configORdefault( 'prepend_sql', array() );
	$main_js_name = configORdefault( 'main_js_name', 'application' );

	$user_scalable = configORdefault( 'user_can_scale', 'no' );

	
?><!DOCTYPE HTML>
<html>
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=<?php echo $user_scalable ?>">
	<meta name="mobile-web-app-capable" content="yes">
	<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" >
	<meta http-equiv="Pragma" content="no-cache" >
	<meta http-equiv="Expires" content="0" >
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title><?php echo $window_title.$ici; ?></title>
<?php
		if (is_array($stylesheets)) {
			$totstylesheets = count($stylesheets);
			for($i=0; $i < $totstylesheets; $i++) {
				print "<link rel='stylesheet' href='".$stylesheets[$i]."' />\n";
			}
		}
		if (is_array($embedTheseCSS)) {
			$totstylesheets = count($embedTheseCSS);
			for($i=0; $i < $totstylesheets; $i++) {
				print "<style>\n";
				readfile( $embedTheseCSS[$i] );
				print "</style>\n";
			}
		}
?>
<script type='text/javascript'><!--
	
    var curLang = null

<?php
		
		// on donne la même unique liste PHP pour usage en javascript, surtout pour requirejs
		echo "var app_paths = ".json_encode( $current_version_paths );
		echo "\n";
		echo "var cookie_prefix = '$cookie_prefix';\n";
		echo "var app_version = '$app_version';\n";
		echo "var window_title = '$window_title';\n";
		echo "var main_js_name = '$main_js_name';\n";
		// 
		echo "var isDEVSITE = ".($isDEVSITE ? "true" : "false").";\n";
		echo "var isONLINE = ".($isONLINE ? "true" : "false").";\n";
		
		if ($ressource_site) {
			echo "window.ressource_site = '$ressource_site';\n";
		}

		//
		if (!isset($curLang)) $curLang = strtolower($_GET['lang']);
		if (!$curLang) {
			$curLang = 'fr';
		}
		print "\n\n window.CURLANG = '$curLang';\n\n";	
		//
		//2016-09-14
		//2017-03-20 : first load was too much revealing of the data to the non-logged visitor. 
		//             there's an empty index.php gate first loaded.
		informjsSESSYO( $SESSYObyGATE );

		echo "window.prepend_sql = {};\n";
		foreach($prepend_sql as $prepsql) {
			include 'app/db/'.$prepsql.'.php';
		}
		
	?>
	

	//utile à  anim.js  et  ui.js
	 window.svp_paths = function( path ){
		var p,r = []
		var i,tot,f,af
		p = path.split('/')
		tot = p.length
		for (i=0; i<tot; i++) {
			f = p[i]
			af = app_paths[ f ]
			if (af != null) f = af
			r.push( f )
		}
		path = r.join('/')
		//onsole.log( "svp_paths() ::: ", path )
		return path
	}


	window.isdef = function( val, defaut ) {
		if (
			(val==null) || (val==undefined) || (
				(typeof defaut == 'number') && ((!(typeof val == 'number')) || isNaN(val)) 
				)
			) return defaut; 
		return val;
	}
	window.pt = function( p1_ou_x, avec_y ) {
		if (avec_y) return {x:p1_ou_x, y:avec_y}
		if (p1_ou_x.x) return { x:p1_ou_x.x, y:p1_ou_x.y }
		return {x:0,y:0}
	}
	
	window.quiestla = 'YO2';

--></script>
<?php
	if ($with_LZstring) {
		print "<script type='text/javascript'><!--LZ\n";
		svp_paths( 'lib/lz-string.js' );//$HEREorTHERE.
		print "--></script>\n";
	}
	if (is_array($outside_lib_scripts)) {
		$totout = count($outside_lib_scripts);
		for($i=0; $i < $totout; $i++) {
			print "<script type='text/javascript'><!--OLS\n";
			readfile( $outside_lib_scripts[$i] )."\n\n";
			print "\n--></script>\n";
		}
	}
	
	if (is_array($embedThoseJS)) {
		$bigExternalsJS = $embedThoseJS[2]; ///à terme, devraient replacer les 5 lignes ci-dessus
		if (is_array($bigExternalsJS)) {
			$totout = count($bigExternalsJS);
			for($i=0; $i < $totout; $i++) {
				print "<script type='text/javascript'><!--BEjs($i [".$bigExternalsJS[$i]."])\n";
				print embedBigExternalJS( $bigExternalsJS[$i] )."\n\n";
				print "\n--></script>\n";
			}
		}
		print embedManyJSandStartLast( $embedThoseJS[0], $embedThoseJS[1] )."\n\n";
	}
	else {
		print "<script type='text/javascript' data-main='ayo_config.js' src='$HEREorTHERE"."lib/require.js'></script>\n";
		print "<script type='text/javascript'><!--\n window.applicationStart = function(){}\n--></script>\n";
	}
?>
</head>
<?php
	include svp_paths("appcode/$whichHtmlBody.php" );
?>
</html>