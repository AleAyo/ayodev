<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>CHK</title>
</head>
<body>
<style>
	td { border-left:1px solid #aaa; border-bottom:1px solid #aaa; font-size:11px; }
</style>
<?php

		//
		$REQTRC = 1;
		function gimmeallfiles( $path ) {
			global $REQTRC;
			$lst = array();
			$all = scandir( $path );
			//$d = dir( $path );
			//if ($d == null) {
			if ($all === false) {
				if ($REQTRC) echo "ERROR gimmeallfiles( $path )\n";
				return $lst;
			}
			//$inorderplease = 
			//while (false !== ($entry = $d->read())) {
			//	if (substr($entry,0,1)=='.') continue;
			//	$lst[] = $entry;
			//}
			//$d->close();
			foreach( $all as $entry ) {
				if (substr($entry,0,1)=='.') continue;
				$lst[] = $entry;
			}
			return $lst;
		}

		function readSESSYO( $ssyoid ) {
			$p = "ssyo/$ssyoid";
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
						print "<td>".trim($parts[1])."</td>";
					}
				}
			}
		}
		
		
		$lst = gimmeallfiles( "ssyo" );
		
		$tot = count($lst)-1;
		$fin = max(0, $tot-50);
		
		print "<p>$tot</p>";
		print "<table border=0 width=3000 cellpadding=3>";
		for($i= $tot; $i>=$fin; $i--) {
			$ssyoid = $lst[$i];
			print "<tr>";
			readSESSYO( $ssyoid );
			print "</tr>";
		}
		print "</table>";
		

?></body>