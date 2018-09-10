<?php
	//
	/**
	 * @license
	 * req_filewrite.php - v0.1
	 * Copyright (c) 2014, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/
	include_once("app/db/utils_req.php");
	
/*
subact: phptodo,
level:  classe,
curfile:   filename,
newfile:   newname,
text:   withThat

*/	
	$subact = $data['subact'];
	$kind = $data['kind'];
	$curfile = $data['curfile'];
	$newfile = $data['newfile'];
	$text = $data['text'];
	//
	/*
	$pathexercices = "req_filechange()";//"app/data/exercices/" . $data['path'] . '.php';
	$pathexercices .= "\n ACT:" . $subact;
	$pathexercices .= "\n KIND:" . $kind;
	$pathexercices .= "\n CURPATH:" . $curfile;
	$pathexercices .= "\n NEWPATH:" . $newfile;
	$pathexercices .= "\n NBLINES:" . count(explode("\n", $text));
	*/
	
	function acceptablePath( $str ) {
		global $patchPasBelle;
		$parts = explode( '/', $str );
		$tot = count($parts);
		if (($tot < 1) || ($tot > 2)) return null;
		//
		if ($tot==1) {
			$parts[] = 'info_'.$parts[0];
			$patchPasBelle = true;
		}
		else {
			$patchPasBelle = false;
		}
		return $parts;
	}
	function writedata_inphp( $p, $text ) {
		$fh = fopen($p, 'w'); // or die("can't open file");
		if (!$fh) {
			 //-----------------------------------------------> return
			return false;
		}
		$head = "<?php /*--\n";
		fwrite( $fh, $head . $text );
		fclose($fh);
		return true;
	}
	

	$pathexercices = "app/data/";
	$dataReturned = array();
	
	//vertir( "req_filechange", $pathexercices );
	
	$curpath = acceptablePath( $curfile );
	$ok = false;
				
	if ($subact == 'saveFile') {
		if ($curpath) {
			$curfile = implode('/', $curpath);
			$p = $pathexercices.$curfile.'.php';
			if (file_exists($p)) {
				//vertir( "req_filechange(saveFile)", $p );
				if (writedata_inphp( $p, $text )) {
					$mess = "OK!!(saveFile)";
					$ok = true;
				}
				else {
					$mess = "ERR(saveFile). pas possible écrire le fichier ($p)";
				}
			}
			else {
				$mess = "ERR(saveFile). le fichier n'existe pas?? (il le devrait!) ($p)";
			}
		}
		else {
			$mess = "ERR(saveFile). probleme avec nom de fichier fourni";
		}
	}
	else if ($subact == 'saveasFile') {
		$newpath = acceptablePath( $newfile );
		if ($newpath) {
			//--créer le dossier si necessaire
			$okdir = true;
			$p = $pathexercices.$newpath[0];
			if (!file_exists($p)) {
				$okdir = mkdir( $p );
			}
			
			if (!$okdir) {
				$mess = "ERR(saveasFile). Problème à créer le répertoire /".$newpath[0]." ($p)";
			}
			else {
				$newfile = implode('/', $newpath);
				$p = $pathexercices.$newfile.'.php';
				if (!file_exists($p)) {
					//vertir( "req_filechange(saveasFile)", $p );
					if (writedata_inphp( $p, $text )) {
						$mess = "OK!!(saveasFile)";
						$ok = true;
					}
					else {
						$mess = "ERR(saveasFile). pas possible écrire le fichier ($p)";
					}
				}
				else {
					$mess = "ERR(saveasFile). le fichier existe déjà?? (il ne devrait pas!) ($p)";
				}
			}
		}
		else {
			$mess = "ERR(saveasFile). probleme avec nom de fichier fourni";
		}
	}
	else if ($subact == 'deleteFile') {
		//cas special ou on demande d'effacer le info_D.php  ...donc tout le dossier, et son contenu?
		if ($patchPasBelle) {
			$p = $pathexercices.$curpath[0];
			$headerfile = $curpath[1].'.php';
			$combien = 0;
			if (file_exists($p)) {
				if (is_dir($p)) { 
					$objects = scandir($p); 
					foreach ($objects as $object) { 
						if (($object != ".") && ($object != "..") && ($object != $headerfile)) { 
							//unlink($p."/".$object); 
							$combien += 1;
							//vertir( "req_filechange(deleteDirectory)", $p.'/'.$object );
						}
					} 
					if ($combien == 0) {
						unlink($p."/".$headerfile); 
						rmdir($p); 
						//vertir( "req_filechange(deleteDirectory)", $p );
						$mess = "OK!!(deleteDirectory)";
						$ok = true;
					}
					else {
						$mess = "ERR(deleteDirectory). il doit être vide. il contient encore $combien tableaux";
					}
				} 
				else {
					$mess = "ERR(deleteDirectory). $p n'est pas un dossier (?)";
				}
			}
			else {
				$mess = "ERR(deleteDirectory). $p n'existe pas (?)";
			}
		}
		elseif ($curpath) {
			$curfile = implode('/', $curpath);
			$p = $pathexercices.$curfile.'.php';
			if (file_exists($p)) {
				//vertir( "req_filechange(deleteFile)", $p );
				if (unlink( $p )) {
					$mess = "OK!!(deleteFile)";
					$ok = true;
				}
				else {
					$mess = "ERR(deleteFile). pas possible détruire le fichier ($p)";
				}
			}
			else {
				$mess = "ERR(deleteFile). le fichier n'existe pas?? (il le devrait!) ($p)";
			}
		}
		else {
			$mess = "ERR(deleteFile). probleme avec nom de fichier fourni";
		}
		
	}
	else {
		//oups?
		$mess = "ERR($subact). action inconnue???";
	}

	if (!$ok) avertir("req_filechange()", $mess);
	$dataReturned['mess'] = $mess;
	// ?
	$ok = 'ok';

?>