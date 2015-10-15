<?php

class WebTestCase extends PHPUnit_Framework_TestCase {
    protected $base_url = 'http://localhost';

    protected function request($path, $data=null, array $headers=null) {
        if (!extension_loaded('curl')) {
            $this->markTestSkipped('The cURL extension is not available.');
        }

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, rtrim($this->base_url . '/' . ltrim($path, '/'), '/'));
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US)');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

        if ($data !== null) {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        }

        if ($headers !== null) {
            curl_setopt($ch, CURLOPT_HEADER, 1);
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        } else {
            curl_setopt($ch, CURLOPT_HEADER, 0);
        }

        $res = curl_exec($ch);

        if ($err = curl_error($ch)) {
            $this->fail($err);
        }

        return [curl_getinfo($ch, CURLINFO_HTTP_CODE), substr($res, curl_getinfo($ch, CURLINFO_HEADER_SIZE))];
    }

    protected function request_json($path, $data=null) {
        list($code, $body) = $this->request($path, $data, [
            'Accept: application/json',
        ]);

        return [$code, json_decode($body, true)];
    }
}