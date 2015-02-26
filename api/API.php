<?php

/**
 * Class API (RESTful API)
 *
 */
class API {

	/**
	 * @var array
	 */
	private $options;
	/**
	 * @var
	 */
	private $host;
	/**
	 * @var string
	 */
	private $url;
	/**
	 * @var
	 */
	private $handle;
	/**
	 * @var
	 */
	private $params;
	/**
	 * @var
	 */
	private $method;
	/**
	 * @var
	 */
	private $data;

	/**
	 * @param $host
	 */
	function __construct($host){
		$this->options = array(
			CURLOPT_HEADER => true,
			CURLOPT_RETURNTRANSFER => true,
			CURLOPT_TIMEOUT => 2
		);

		$this->host 	= 'http://'.$host;
		$this->url 		= '/';
		$this->method 	= 'GET';
	}

	/**
	 * @param $url
	 * @return $this
	 */
	public function setURL($url){
		$this->url = $url;
		return $this;
	}

	/**
	 * @param $host
	 * @return $this
	 */
	public function setHost($host){
		$this->host = $host;
		return $this;
	}

	/**
	 * @param $method
	 * @return $this
	 */
	public function setMethod($method){
		if($method == 'POST'){
			$this->options[CURLOPT_POST] = 1;
		}
		$this->method = $method;
		return $this;
	}

	/**
	 * @param $params
	 * @return $this
	 */
	public function setParams($params){
		$this->params = http_build_query( $params );
		return $this;
	}

	/**
	 * @param $data
	 * @return $this
	 */
	public function setData($data){
		$this->data = $data;
		return $this;
	}

	/**
	 * @return resource
	 */
	public function setHandle(){
		$this->handle = curl_init();
		return  $this->handle;
	}

	/**
	 * @return resource
	 */
	public function getHandle(){
		if( $this->handle ){
			return $this->handle;
		}else{
			return $this->setHandle();
		}
	}

	/**
	 * @return mixed
	 */
	public function call()
	{
		if (!empty($_FILES)){

			$files = [];
			foreach($_FILES as $k => $v) {
				$files[$k] = $this->uploadFile($v['name'], '/Users/kostyan/PhpstormProjects/azimuth/files/', $v['tmp_name']);
			}
		}

		$options = array(
			CURLOPT_URL => $this->host.$this->url."?".$this->params,
			CURLOPT_CUSTOMREQUEST => $this->method, // GET POST PUT PATCH DELETE HEAD OPTIONS
		);

		if( $this->method == 'POST'){
			$this->data['test'] = 'test';
			if(!empty($files)){
				foreach($files as $key=>$file) {
					$this->data[$key] = $file;
				}
			}
			$options[CURLOPT_POSTFIELDS] = $this->data;
		}

		$options = $options + $this->options;

		curl_setopt_array($this->getHandle(), $options );
		print_r($options);
		$response = curl_exec($this->getHandle());
		$info = curl_getinfo($this->getHandle());
		print_r($info);
		print_r($response);
		return json_decode($response, true);
	}

	private function uploadFile($filename, $dest, $tmp_name)
	{
		$destination = $dest.$filename;

		if (move_uploaded_file($tmp_name, $destination)){
			return  '@'.$destination;
		}

		return false;
	}

}

/* $target_url = 'http://127.0.0.1/accept.php';

 $file_name_with_full_path = realpath('./sample.jpeg');

 $post = array('extra_info' => '123456','file_contents'=>'@'.$file_name_with_full_path);

 $ch = curl_init();
 curl_setopt($ch, CURLOPT_URL,$target_url);
 curl_setopt($ch, CURLOPT_POST,1);
 curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
 curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
 $result=curl_exec ($ch);
 curl_close ($ch);
 echo $result;*/


// Usage: uploadfile($_FILE['file']['name'],'temp/',$_FILE['file']['tmp_name'])

