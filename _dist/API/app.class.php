<?php
	
	require('obj/Base.svc.php');	
	
	class compTIA extends BaseService{
		var $post_data;
		
		function send_note(){
			
			$notes = $this->post_data->notesData;
			//$notes = file_get_contents('note2.json');
			$data = json_decode($notes,true);
			unset($data['notesData']['logs']);
			
			$noteArr = array();			
			foreach($data['notesData']['chapter'] as $k=>$v){
				if(is_array($v)){
					$page = $v['page'];
					foreach($page as $kp=>$vp){
						if(is_array($vp)){
							foreach($vp['index'] as $kn=>$vn){
								$noteArr[]=$vn;
							}
						}	
					}
				}
			}

			
			
				
				
			$to = $data['email'];
			//$from = 'michaelk@allthingsmedia.com';
			$from = "Comp TIA Notes" . "<" . 'tia_notes@pearson.com' . ">";
			$replyto = "No-Reply@pearson.com <no-reply@pearson.com>";
			$subject = "Your Comp TIA notes.";

					
			$bound_text = md5(time());
			$bound = "--".$bound_text."\r\n";
			$bound_last =  "--".$bound_text."--\r\n";
				 
			$headers =	"From: ". $from . "\r\n";
			$headers .=	"MIME-Version: 1.0\r\n";
			$headers .= "Reply-To: ". $replyto . "\r\n";
			$headers .= "Content-Type: multipart/mixed; boundary=\"$bound_text\"";
			$message = '';
			$message .=	"If you can see this MIME than your client doesn't accept MIME types!\r\n"
				.$bound;
	
			//message template--------------------------------------------------------
			
			$message .= "Content-Type: text/html; charset=iso-8859-1\r\n"
				."Content-Transfer-Encoding: 7bit\r\n\r\n";
			
			ob_start();
			include 'templates/email.php';
			$message .= ob_get_contents();
			ob_end_clean();
			
			$message .= "\r\n\r\n"
				.$bound_last;
			
			if(mail($to, $subject, $message, $headers)){
				echo json_encode(array("Response"=>array('Code'=>'0','Message'=>'Email Successfully Sent.')));
			}else{
				echo json_encode(array("Response"=>array('Code'=>'1','Message'=>'Email not Successfully Sent.')));					
			}
				exit;						
		}

		function pollUpdate(){
			$pollData = $this->post_data->pollData;
			//$pollData = file_get_contents('poll.json');
			$poll = json_decode($pollData,true);
			$chapterData = $poll['pollData']['chapter'];
			$file = key($chapterData);
			$val = $chapterData[$file];
		
			$filePath = 'polls/'.strtoupper($file).'.json';
			$existingDataFile = file_get_contents($filePath);
			$existingData = json_decode($existingDataFile,true);
			unset($existingDataFile);
			
			$existingData[$val] = $existingData[$val] + 1;
			
			$json = json_encode($existingData);
			file_put_contents($filePath,$json);
			
			echo $json;
			exit;
		}
		
	}
	
?>