<?php

//error_reporting(2047);
#phpinfo();
require __DIR__.'/config.php';
require __DIR__.'/API.php';
//'uml.maggadda.dev95.ru'

try {

	$host = (isset($_GET['host'])) ? $_GET['host'] : $API['jsoncreate'];

	$APIService = new API($host);

	$APIService->setMethod('POST');


    var_dump($_REQUEST); exit;
	$response = $APIService->setURL(http_build_query($_REQUEST))->call();


	echo json_encode($response);

}catch( \Exception $e ){
	echo $e->getMessage();
}