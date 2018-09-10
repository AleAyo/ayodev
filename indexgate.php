<?php
/**
 * @license
 * indexgate.php - v0.1.0
 * Copyright (c) 2016, Alexandre Ayotte
 *
 * code is licensed under the MIT License.
 * http://www.opensource.org/licenses/MIT
 */
	
?><!DOCTYPE HTML>
<html>
<head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
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
		//
		if (!isset($curLang)) $curLang = strtolower($_GET['lang']);
		if ($curLang) {
			$curLang = 'fr';
		}
		print "\n\n window.CURLANG = '$curLang';\n\n";	
		//
		//2016-09-14
		//2017-03-20 : first load was too much revealing of the data to the non-logged visitor. there's an empty index.php gate first loaded.
		//  this is EMPTY GATE
		informjsSESSYO( );
?>
	
	window.quiestla = 'YOgate';


--></script>
<?php
	//
	if (is_array($embedThoseJS)) {
		$embedThoseJS = array( 
			explode(",", "AYO, LANG, MISC, HTML, FORMKIT, LOGIN, DB, myGateApplication") , 
			array( 'libayo/ayo', 'libayo/lang', 'libayo/misc', 'libayo/html', 'libayo/formkit', 'appcode/login', 'libayo/database', 'libayo/ayo_gate_app' )
		);
		//print "<script type='text/javascript'><!--\n";
		print embedManyJSandStartLast( $embedThoseJS[0], $embedThoseJS[1] );
		//print "--></script>\n";
	}
	else {
		print "<script type='text/javascript' data-main='ayo_gate_config.js' src='$HEREorTHERE"."lib/require.js'></script>\n";
		print "<script type='text/javascript'><!--\n window.applicationStart = function(){}\n--></script>\n";
	}
?>
</head>
<?php
	include svp_paths("appcode/$whichHtmlBody.php" );
?>
</html>