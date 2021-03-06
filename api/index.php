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
        if (!empty($_FILES)) {
            $post = $_POST;

            if(!file_exists($_SERVER['DOCUMENT_ROOT'].'f/tmp')) {
                mkdir($_SERVER['DOCUMENT_ROOT'].'f/tmp', 0777);
            }
            $url=substr($_SERVER['REQUEST_URI'],4);

            foreach ($_FILES as $files) {
                $file_count = count($files['name']);
                for($i = 0; $i < $file_count; $i++) {
                    $file = $_SERVER['DOCUMENT_ROOT'].'f/tmp/'.$files['name'][$i];

                    if(move_uploaded_file($files['tmp_name'][$i], $file)){
                        $post['file['.$i.']'] = new CURLFile($file, $files['type'][$i]);
                    }
                    else {
                        throw new Exception('Could not move file to '.$file.' see '.__FILE__);
                    }
                }
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, 'http://'.$API['host'].$url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_SAFE_UPLOAD, false);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $post);

                $response = curl_exec($ch);

                curl_close($ch);
                echo $response;
                die;
            }
        }else {
            $APIService->setMethod('POST');
            $_POST = json_decode(file_get_contents("php://input"), true);
            $APIService->setData($_POST);
        }
    }
    else if($_SERVER['REQUEST_METHOD'] == 'PUT') {
        $params = json_decode(file_get_contents('php://input'), true);
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

