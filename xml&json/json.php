<?php
header('Access-Control-Allow-Origin: *');
header('Content-type: application/json');

$jsonFile = 'emails.json';
$jsonString = file_get_contents($jsonFile);

var_dump($jsonString);
?>