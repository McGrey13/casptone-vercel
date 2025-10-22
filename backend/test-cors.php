<?php

$ch = curl_init('http://localhost:8000/api/test');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Origin: http://localhost:5173',
    'Access-Control-Request-Method: GET',
    'Access-Control-Request-Headers: content-type',
]);

$response = curl_exec($ch);

if ($response === false) {
    echo 'cURL Error: ' . curl_error($ch);
} else {
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headers = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    
    echo "=== Response Headers ===\n";
    echo $headers . "\n";
    echo "=== Response Body ===\n";
    echo $body . "\n";
}

curl_close($ch);
