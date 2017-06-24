<?php
	class BaseService{
		var $db;
		
		function BaseService(){
			//$this->db = $this->db();
		}
		
		/*
		No DB Needed @ 6-19-13
		function db(){
			require('db/database.svc.php');
			return $db;
		}
		*/
		
		//Code is numeric Code, $Params should be array
		function jsonEncode($Code,$Talk,$Params=array()){
			$return = $this->BuildResponse($Code,$Talk,$Params);
			exit(json_encode($return));	
		}
		
		//code is numeric
		function Status($code, $talk){
			switch($code){
				case 0:
					$message = 'Success';
				break;
				case -1:
					$message = 'Failed';
				break;
				default:
					$message = $talk;
				break;
			}
			$Response = array('status-code'=>$code,'message'=>$message);
			return $Response;
		}
		
		//Builds 
		function BuildResponse($Code,$Talk,$Data){
			$Response = $this->Status($Code, $Talk);
			
			if(is_array($Data) && $Data != '' && !empty($Data)){
				$return = array('Response'=>$Response,'Data'=>$Data);
			}else{
				$return = array('Response'=>$Response);	
			}
			return $return;
		}
			
	}
	
?>