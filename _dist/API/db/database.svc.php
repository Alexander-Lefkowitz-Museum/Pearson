<?php
	include_once('conf.my_db.php');
	include_once('object.my_db.php');
	
	$db = new BaseClass($b_type,$Cfg_host,$Cfg_user,$Cfg_password,$Cfg_db);
	
?>