<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>MANAGING project ViewDefs</title>
	<style>
		td { border-bottom:1px solid #999; border-right:1px solid #999; font-size:11px; }
		.pumped { font-size:21px; padding:4px 5px; }
		.taponnage { border-bottom:1px solid #fff; border-right:none; vertical-align:bottom }
		.bigger { border-bottom:1px solid #999; border-right:none; vertical-align:bottom }
		.header { background:#ccc }
		h1 { font-size:16px; }
	</style>
</head>
<body><div style="position:fixed; z-index:2; top:0; left:0; background:#fff; width:100%">
<?php
/**
 * @license
 * build.php - v0.1.0
 * Copyright (c) 2014, Alexandre Ayotte
 *
 * code is licensed under the MIT License.
 * http://www.opensource.org/licenses/MIT
 */
	//
	//
	ini_set('display_errors', 1);
	error_reporting(E_ERROR | E_PARSE);

	include "ayoversions.php";

	$grandgroupe = trim($_POST['GG']);  if (!$grandgroupe) $grandgroupe = 'aa';
	$projet = trim($_POST['P']);
	$lequel = trim($_POST['V']);
	$usr_level = trim($_POST['U'])*1;
	$A = $_POST['A'];  if (!$AA) $AA = 'PHP'; else $AA = $A;
	
	function formline( $tit, $key, $val, $chx ){
		print "<tr><td class='bigger pumped'>$tit:</td><td class=taponnage><input class=pumped type=text size=30 name=$key value=".$val."><span class=pumped>$chx</span></td></tr>\n";
	}
	
	print "<form method=post name=viewdefs action='build.php' >\n";
	print "<table border=0>";
	formline( "Grand dossier", "GG", $grandgroupe );
	formline( "Projet", "P", $projet, "ex: <b>ecoasys/app/views</b> sans /  ....Folder doit être ReadWrite anybody" );
	formline( "Table ou view", "V", $lequel, "ex: <b>usagers</b> ..on ouvre <i>xxx_def.php</i> pour créer <i>xxx.php</i>" );
	formline( "Quoi faire", "A", $AA, 'PHP, JS' );
	formline( "Testing usr_level", "U", $usr_level, "0 à 99" );
	print "<tr><td class=taponnage colspan=2><input type=submit class=pumped value='Transformer/générer' name='submit'></td></tr>";
	print "</table>\n";
	print "</form>\n";
?></div>
<pre style="margin-top:350px">
<?php
	print "Action = $A<hr>";
	
	if ($A == "PHP") {
		include_once 'libdbayo_'.$phpdb_v."/buildphpview.php";
		prep_viewdef( "../$grandgroupe/$projet/", $lequel );
	}
	elseif ($A == "JS") {
		include_once 'libdbayo_'.$phpdb_v."/buildjsview.php";
		prep_viewdef( "../$grandgroupe/$projet/", $lequel );
	}
	
?>
</pre>
</body>
</html>