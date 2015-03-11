<?php
require __DIR__.'/config.php';
require __DIR__.'/API.php';

try {
	$host = (isset($_GET['host'])) ? $_GET['host'] : $API['host'];

	$APIService = new API($host);
	$APIService->setMethod('GET');

	$request = str_replace( 'api/', '', $_GET['_request']);
	unset($_GET['_request']);
	unset($_GET['host']);

	if($_SERVER['REQUEST_METHOD'] == 'GET') {
		$APIService->setParams($_GET);
	}

	else if($_SERVER['REQUEST_METHOD'] == 'POST') {
		if (!empty($_FILES)){
//			print_r($_FILES);
//			die();
//			print_r(sys_get_temp_dir());die;
			foreach($_FILES as $key=>$file) {
//				print_r($file);
//				print_r(realpath('./'.$file['tmp_name']));die;
//				$exec = "curl -i -X POST -H \"Content-Type: multipart/form-data\" -F \"file=@{$file['tmp_name']};filename={$file['name']};\" http://arrow.b.compass/catalogue/loadfiles";
//				$exec = "curl -i -X POST -H \"Content-Type: multipart/form-data\" -F \"file=@{$file['tmp_name']};filename={$file['name']};\" http://arrow.b.compass/catalogue/loadfiles";
//				echo $exec;
//				echo system($exec);
//				print_r(getcwd());die;
//				print_r(move_uploaded_file($file['tmp'], '/var/www/green/compass/f/tmp/test'));
				$upload_dir = $_SERVER['DOCUMENT_ROOT'] . "tmp/";
//				print_r(is_writeable($upload_dir));
				if(move_uploaded_file($file['tmp_name'], $upload_dir.'test.jpg')){
					print_r('Ok');
				}else{
					print_r('IDI NA XUI');
				}

//				move_uploaded_file($file['tmp'], '../tmp/test.jpg');
//				die;
				$request = curl_init();
				print_r(realpath($upload_dir.'test.jpg'));
				$header = array("Content-type: multipart/form-data");
//				$request = curl_init('http://arrow.b.compass/catalogue/loadfiles');
//					$post = array('extra_info' => '123456','file_contents'=>'@'.$file['tmp_name']);
//				move_uploaded_file($file['tmp_name'], 'data/test.jpg');
				curl_setopt($request, CURLOPT_URL, 'http://arrow.b.compass/catalogue/loadfiles');
				curl_setopt($ch,CURLOPT_HTTPHEADER,$header);
				curl_setopt($request, CURLOPT_POST, true);
//				curl_setopt($request, CURLOPT_SAFE_UPLOAD, true);

				curl_setopt(
					$request,
					CURLOPT_POSTFIELDS,
					array(
						'file' => '@'.$upload_dir.'test.jpg'.';filename=test.jpg;type=file;'
//						'file[]' => '@' . $upload_dir.'test.jpg'
//						'file_contents' => '@' . $file['tmp_name'].';filename=name.jpg',
					));
				curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

				$t = curl_exec($request);
//				print_r(curl_getinfo($request));die;
				print_r($t);die;
////				print_r();
				curl_close($request);
			}

		}else {

			$APIService->setMethod('POST');
			$_POST = json_decode(file_get_contents("php://input"), true);
			$APIService->setData($_POST);
		}
	}
	else if($_SERVER['REQUEST_METHOD'] == 'PUT') {
		$input = file_get_contents('php://input');
		parse_str($input, $params);

		$APIService->setMethod('PUT');
		$APIService->setData($params);
	}
	else if($_SERVER['REQUEST_METHOD'] == 'DELETE') {
		$input = file_get_contents('php://input');
		parse_str($input, $params);

		$APIService->setMethod('DELETE');
		$APIService->setData($params);
	}

	$response = $APIService->setURL($request)->call();
	echo json_encode($response);

}catch( \Exception $e ){
	echo $e->getMessage();
}