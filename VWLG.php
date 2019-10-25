<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>LogView</title>
</head>
<body>
<style>
	td { border-bottom:1px solid #ddd; border-right:1px solid #ddd; vertical-align:top; font-size:14px; padding:3px 6px; }
	.header { background:#ddd }
	h1 { font-size:19px; }
</style>
<?php
		if (! isset($goodMtPss)) $goodMtPss = array("asdfghjkl", "bgtvfr");

		$mtpss = trim($_POST['mp']);
		$aa = $hilevel = ($mtpss == $goodMtPss[0]);
		$bad = (($mtpss != $goodMtPss[1]) && (! $aa));

		$ssyoid = trim($_POST['ssyoid']);
		$subssyo = trim($_POST['subssyo']);
		if ((!$subssyo) || (!is_dir($subssyo))) {
			$subssyo = "ssyo/";
		}

		$NOW = time();
		$NOW_FOREVER = date( "Y-m-d G:i:s", $NOW );

?>
	<form method=post>
		D: <input type=text name=subssyo value='<?php echo $ssyoid ?>' size=18 style='font-size:14px;padding:3px 5px'>
		S: <input type=text name=ssyoid value='<?php echo $ssyoid ?>' size=18 style='font-size:14px;padding:3px 5px'>
		P: <input type=password name=mp value='<?php if ($aa) echo $mtpss ?>' size=14 style='font-size:14px;padding:3px 5px; <?php if (!$aa) echo "border-color:#F55" ?>'>
		<input type=submit name=submit value='SEE'  style='font-size:14px;padding:3px 5px; margin-left:10px'></form>
<?php

	
if (! $bad) {
		//
		$REQTRC = 1;
		function gimmeallfiles( $path ) {
			global $REQTRC;
			$lst = array();
			$all = scandir( $path, 1 ); //reverse order : donc sera en ordre du plus récent au plus ancien

			if ($all === false) {
				if ($REQTRC) echo "ERROR gimmeallfiles( $path )\n";
				return $lst;
			}
			foreach( $all as $entry ) {
				if (substr($entry,0,1)=='.') continue;
				if (is_dir($entry)) continue;
				//
				$lst[] = $entry;
			}
			return $lst;
		}

		function readLOG( $ssyoid ) {
			$p = "ssyo/$ssyoid";
			$dataread = file_get_contents( $p );
			if ($dataread === false) {
				//$record['error'] = 
				print 'probleme lecture fichier '.$p."\n";
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
					print "$itm \n";
				}
			}
		}
		
		
		$lst = gimmeallfiles( $subssyo );
		
		$tot = count($lst);
		
		print "<p>$tot</p>";
		print "<div  style='display:inline-block'>";
		print "<table border=0 cellpadding=3>";
		for($i= 1; $i<$tot; $i++) {
			$ssyoid = $lst[$i];
			print "<tr>";
			print "<td>".$subssyo.'/'.$ssyoid."</td>";
			print "</tr>";
		}
		print "</table>";
		print "<pre  style='display:inline-block'>";
		readLOG( $ssyoid );
		print "</pre>";
}	

?></body>