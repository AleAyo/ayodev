<?php
	header('HTTP/1.0 404 Not Found', true, 404);
	//ini_set('display_errors', 1);
	//error_reporting(E_ERROR | E_PARSE);
	/**
	 * @license
	 * oups404.php - v0.1.0
	 * Copyright (c) 2014, Alexandre Ayotte
	 *
	 * code is licensed under the MIT License.
	 * http://www.opensource.org/licenses/MIT
	 */

	include( "app/config.php");
	function svp_paths( $s ){ return $s; }
	function configORdefault( $key, $def ) {
		global $config;
		if (is_array($config) && array_key_exists($key, $config)) return $config[$key];
		return $def;
	}
	$site = configORdefault( 'app_domainname', 'unknown.cyberlude.ca' );
	
    //$site = 'methobulles.net';
    $lang = configORdefault( 'app_lang', 'bi' );
    
    //if ($_GET['lang']) $lang = $_GET['lang'];
    
    /*--------error 404---------//
    $entete = "From: err_404@".$site."\n\r";
    $page = $_SERVER['REQUEST_URI'];

	if (strpos($page, "wp-") === false) {
	    $cnt = "TRACKING:::\n";
	    $cnt .= "PAGE : ".$page;
	    $cnt .= "SERVER['HTTP_USER_AGENT']: ".$_SERVER['HTTP_USER_AGENT']."\n";
	    $cnt .= "SERVER['SCRIPT_URL']:      ".$_SERVER['SCRIPT_URL']."\n";
	    $cnt .= "SERVER['REMOTE_ADDR']:     ".$_SERVER['REMOTE_ADDR']."\n";
	    $cnt .= "SERVER['PHP_SELF']:        ".$_SERVER['PHP_SELF']."\n";
	    $cnt .= "SERVER['SERVER_NAME']:     ".$_SERVER['SERVER_NAME']."\n";

	    @mail( 'aa@cyberlude.com', '404:'.$site.' >>['.$page.']', $cnt, $entete );		
	}
    //--------------------------*/
    
?><!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Strict//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd'>
<html xmlns='http://www.w3.org/1999/xhtml' xml:lang='en' >
<head>
<meta http-equiv='content-type' content='text/html; charset=utf-8' >

<? if (($lang=='fr') || ($lang=='bi')) { ?>
<title>Erreur 404</title>
<? } if (($lang=='en') || ($lang=='bi')) { ?>
<title>Error 404</title>
<? } ?>

<script type='text/javascript'></script>
<style type='text/css'>
* { 
  margin: 0px;
  padding: 0px;
  }
body { font-family: serif; font-size: 12pt; line-height: 1.4em; background: #F0F0F0; text-align: center; }
#container {
	width: 640px;
	margin: auto;
	background: #FFF;
	position: relative;
    border: solid 1px #000;
    margin-top: 24px;
    margin-bottom: 12px;
    text-align: left;
    }
html td {
  vertical-align: top;
  padding: 36px;
  }
h1,h2,h3 {
  font-family: courier, "courier new", sans-serif, monospace;
  font-size: 1.4em;
  font-weight: bold;
  margin-bottom: 6px;
  }
h3 {
  border-bottom: 1px dotted #444;
  }
p {
  margin-top: 0px;
  margin-bottom: 0px;
  letter-spacing: 0px;
  text-align: justify;
  }
.gris {
  font-size:10px;
  color:#777;
}
</style>
</head>

<body>
 <div id="container">
  <table width=100% border=0><tr>
  <td id='main'>
<?php if (($lang=='fr') || ($lang=='bi')) { ?>
    <h3><span>La ressource demandée est introuvable...</span></h3>
    <p class="p2">&nbsp;</p>
    <p class="p2">Si l'erreur provient d'un lien du site, la situation sera corrigée sous peu.</p>
    <p class="p2">Nous vous invitons à continuer votre <a href="<?php print $site ?>">exploration du site.</a></p>
    <p class="p2">&nbsp;</p>
    <p class="p2"><em>Bonne visite!</em></p>
    <p class="p2">&nbsp;</p>
<?php } if (($lang=='en') || ($lang=='bi')) { ?>
    <h3><span>The ressource requested was not found...</span></h3>
    <p class="p2">&nbsp;</p>
    <p class="p2">If the error originated from one of our links, it will be corrected shortly.</p>
    <p class="p2">In the meantime, please continue your <a href="<?php print $site ?>">exploration here.</a></p>
    <p class="p2">&nbsp;</p>
    <p class="p2"><em>Have a nice visit!</em></p>
    <p class="p2">&nbsp;</p>
<?php } ?>
    <p class="gris"><?php echo date("Y-m-d G:i:s"); ?></p>
  </td>
  </tr></table>
 </div>
</body>
</html>