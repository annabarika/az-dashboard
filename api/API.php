<?php

/**
 * Class API (RESTful API)
 *
 */
class API
{
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
    public function __construct($host)
    {
        $this->options = array(
            CURLOPT_HEADER => false,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30
        );
        $this->host = 'http://' . $host;
        $this->url = '/';
        $this->method = 'GET';
    }

    /**
     * @param $url
     * @return $this
     */
    public function setURL($url)
    {
        $this->url = urldecode($url);
        return $this;
    }

    /**
     * @param $host
     * @return $this
     */
    public function setHost($host)
    {
        $this->host = $host;
        return $this;
    }

    /**
     * @param $method
     * @return $this
     */
    public function setMethod($method)
    {
        $this->method = $method;
        return $this;
    }

    /**
     * @param $params
     * @return $this
     */
    public function setParams($params)
    {
        $this->params = http_build_query($params);
        return $this;
    }

    /**
     * @param $data
     * @return $this
     */
    public function setData($data)
    {
        $this->data = $data;
        return $this;
    }

    /**
     * @return resource
     */
    public function setHandle()
    {
        $this->handle = curl_init();
        return $this->handle;
    }

    /**
     * @return resource
     */
    public function getHandle()
    {
        if ($this->handle) {
            return $this->handle;
        } else {
            return $this->setHandle();
        }
    }

    /**
     * @return mixed
     */
    public function call()
    {
        $start_time = microtime(true);

        $options = array(
            CURLOPT_URL => $this->host . $this->url . "?" . $this->params,
            CURLOPT_CUSTOMREQUEST => $this->method, // GET POST PUT PATCH DELETE HEAD OPTIONS
        );
        if ($this->method == 'POST' || $this->method == 'PUT') {
            $options[CURLOPT_POSTFIELDS] = http_build_query($this->data);
        }

        $options = $options + $this->options;
        curl_setopt_array($this->getHandle(), $options);
        $result = curl_exec($this->getHandle());

        $HttpCode = curl_getinfo($this->getHandle(), CURLINFO_HTTP_CODE);
        $totalTime = curl_getinfo($this->getHandle(), CURLINFO_TOTAL_TIME);
        $connectTime = curl_getinfo($this->getHandle(), CURLINFO_CONNECT_TIME);
        $nameLookupTime = curl_getinfo($this->getHandle(), CURLINFO_NAMELOOKUP_TIME);

        $end_time = microtime(true);

        $timeDiff = round(((float)$end_time - (float)$start_time), 3);

        if (curl_errno($this->getHandle())) {

            return [
                'error' => [
                    'code'                          => $HttpCode,
                    'totalTime (Transfer Time)'     => $totalTime,
                    'connectTime'                   => $connectTime,
                    'nameLookupTime'                => $nameLookupTime,
                    'difference'                    => $timeDiff,
                    'message'                       => curl_error($this->getHandle())
                ]
            ];
            //throw new \Exception(curl_error($this->getHandle()));
        }
        /*return array_merge([
            'debug' => [
                'code'                          =>  $HttpCode,
                'totalTime (Transfer Time)'     => $totalTime,
                'connectTime'                   => $connectTime,
                'nameLookupTime'                => $nameLookupTime,
                'difference'                    => $timeDiff
            ]
        ],
            json_decode($result, true));*/
        return json_decode($result,true);
    }
}