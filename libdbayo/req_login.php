<?php
	//
	/**
	 * @license
	 * req_login.php - v0.1
	 * Copyright (c) 2014, Alexandre Ayotte
	 *
	 * misc.js is licensed under the MIT License.
	 * https://www.opensource.org/licenses/MIT
	**/

	function du($id,$em,$pseudo,$mp,$level) { 
		return array( 'id'=>$id, 'email'=>$em, 'pseudo'=>$pseudo, 'mtpss'=>$mp, 'level'=>$level );
	}
	
	
	
	$dataReturned = array();
	$dataReturned['error'] = "user not found";
	
	$userlist = array();
	$fichier = "app/data/usagers/index.php";

	$dataread = file_get_contents( $fichier );
	if ($dataread === false) {
		$dataReturned['error'] = 'probleme lecture fichier usagers';
		//vertir( "USERLIST", "factory ids" );
	}
	else {
		$lst = explode("\n", $dataread);
		foreach($lst as $itm) {
			$itm = trim($itm);
			if (!(strpos($itm, "<?" ) === false)) continue;
			if (!(strpos($itm, "//") === false)) continue; //conséquence: pas de // dans le record user
			if (strlen($itm)>0) {
				$parts = explode("\t", $itm);
				for( ; count($parts) < 5; $parts[]='');
				$userlist[] = array( 
						'id'=>$parts[0], 
						'email'=>$parts[1], 
						'pseudo'=>$parts[2],
						'mtpss'=>$parts[3], 
						'level'=>$parts[4] );
			}
		}
		$tot = count($userlist);
		//vertir( "USERLIST", "loaded ids($tot) from:", $fichier );
	}
	
	
	if ($usr_id_to_reverify) {
		$mp = $data['mtpss'];
		foreach($userlist as $usr) {
			//var_dump($usr);
			if (($usr['id'] == $usr_id_to_reverify) && ($mp == $usr['mtpss'])) {
				$usr_id = $usr_id_to_reverify;
				$dataReturned = array( 'email'=> $usr['email'], 'pseudo'=>$usr['pseudo'], 'level'=>$usr['level'] );
				break;
			}
		}
	}
	else {
		$em = $data['email'];
		$mp = $data['mtpss'];

		if ($em && $mp) {
			foreach($userlist as $usr) {
				$usrem = $usr['email'];
				$usrmp = $usr['mtpss'];
				if ($usrem == $em) {
					if ($usrmp == $mp) {
						$usr_id = $usr['id'];
						$dataReturned = array( 'email'=> $usr['email'], 'pseudo'=>$usr['pseudo'], 'level'=>$usr['level'] );
					}
					break;
				}
			}
		}
	}
	
	//pour voir mieux traces dans le temps...
	$dataReturned['timestamp'] = date("Y-m-d G:i:s");
	//vertir("timestamp!!", $dataReturned['timestamp'] );
	

?>