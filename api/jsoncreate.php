<?php

//error_reporting(2047);
#phpinfo();
require __DIR__.'/config.php';
require __DIR__.'/API.php';

try {

	$host = (isset($_GET['host'])) ? $_GET['host'] : $API['jsoncreate'];

	$APIService = new API($host);

	$APIService->setMethod('GET');

	$response = $APIService->setURL(http_build_query($_REQUEST))->call();


	echo json_encode($response);

}catch( \Exception $e ){
	echo $e->getMessage();
}