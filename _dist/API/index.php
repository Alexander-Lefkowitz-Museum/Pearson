<?php
	
	include_once('app.class.php');
	
	if(isset($_GET['params'])){
		$params = $_GET['params'];
	}else{
		$params = '';	
	}
	ini_set("log_errors", 1);
	ini_set("error_log", "log.log");
	
	/* Test Data 
	$testArr = array();
	$testArr['email'] = 'michaelk@allthingsmedia.com';
	$testArr['ModelYear'] = '2014';
	$testArr['Background'] = '1';
	$testArr['ModelType'] = 'Cabrio';
	$testArr['ModelName'] = 'Electric Drive';	
	$testArr['Paint'] = '1';
	$testArr['SoftTop'] = '1';
	$testArr['TridionCell'] = '1';
	$testArr['Overlay'] = '5';
	$testArr['Wheels'] = '1';
	*/
	
	$myobject = new compTIA;
	$myobject->post_data = (object)$_POST;
	//logRec($_POST);
	//$myobject->post_data = (object)$testArr;
	//logRec($testArr);
	call_user_func(array($myobject, $_GET['e']));
?>