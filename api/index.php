<?php
require __DIR__.'/config.php';
require __DIR__.'/API.php';

$host = (isset($_GET['host'])) ? $_GET['host'] : $API['host'];

$APIService = new API($host);
$APIService->setMethod('GET');

$request = $_GET['_request'];
unset($_GET['_request']);
unset($_GET['host']);

if(!empty($_GET)){
	$APIService->setParams($_GET);
}

if(!empty($_POST)){
	$APIService->setMethod('POST');
	$APIService->setData($_POST);
}


$response = $APIService->setURL($request)->call();

print_r($response);