<?php
//error_reporting(2047);

require __DIR__.'/config.php';
require __DIR__.'/API.php';
//'uml.maggadda.dev95.ru'

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
		$APIService->setMethod('POST');
		$_POST = json_decode(file_get_contents("php://input"), true);
		$APIService->setData($_POST);
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