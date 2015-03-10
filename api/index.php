<?php
error_reporting(2047);
#phpinfo();
require __DIR__.'/config.php';
require __DIR__.'/API.php';
//'uml.maggadda.dev95.ru'
#echo file_get_contents('http://compass-buyer.local/order/load');
#die();

try {
	$host = (isset($_GET['host'])) ? $_GET['host'] : $API['host'];

	$APIService = new API($host);
	$APIService->setMethod('GET');

	if(!isset($_GET['request'])){
		$request = $_SERVER['REDIRECT_URL'];
	}else{
		$request = $_GET['_request'];
		unset($_GET['_request']);
	}
	$request = str_replace( 'api/', '', $request);

	unset($_GET['host']);

	if($_SERVER['REQUEST_METHOD'] == 'GET') {
		$APIService->setParams($_GET);
	}

	else if($_SERVER['REQUEST_METHOD'] == 'POST') {
		if (!empty($_FILES)){

			foreach($_FILES as $key=>$file) {
				$exec = "curl -i -X POST -H \"Content-Type: multipart/form-data\" -F \"file=@{$file['tmp_name']};filename={$file['name']};id=4\" http://lex.b.compass/order/loadfiles";
				echo $exec;
				echo system($exec);

/*				$request = curl_init('http://lex.b.compass/order/loadfiles/');
				curl_setopt($request, CURLOPT_POST, true);
				curl_setopt($request, CURLOPT_SAFE_UPLOAD, true);

				curl_setopt(
					$request,
					CURLOPT_POSTFIELDS,
					array(
						'file' => '@' . $file['tmp_name']
					));
				curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
				print_r(curl_exec($request));
				curl_close($request);*/
			}
die();
			/*$files = [];
			require __DIR__.'/CURLBot.php';

			$bot = new CurlBot();
			foreach($_FILES as $key=>$file) {
				print_r($file);
				$file['name'] = $file['tmp_name'];
				$bot->submitForm('http://lex.b.compass/order/loadfiles', array(), $file);
				print_r($bot->getPageHeader());
				print_r($bot->getPageBody());
			}

			die();*/
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