<?php

//error_reporting(2047);
#phpinfo();
require __DIR__.'/config.php';
require __DIR__.'/API.php';

try {

	$host = (isset($_GET['host'])) ? $_GET['host'] : $API['create'];
	$APIService = new API($host);

    $data = array_shift($_REQUEST['data']);


	$APIService->setMethod('POST');
    $APIService->setData($data);
	$response = $APIService->call();

	echo json_encode($response);

}catch( \Exception $e ){
	echo $e->getMessage();
}