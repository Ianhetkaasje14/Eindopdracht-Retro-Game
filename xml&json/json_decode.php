<?php
header('Content-Type: text/html; charset=UTF-8');

$jsonFile = 'emails.json';
$jsonString = file_get_contents($jsonFile);
$emails = json_decode($jsonString, true);


echo "<h1>Output</h1>";
echo "<pre>";
var_dump($emails);
echo "</pre>";

echo "<h2>Persoon – Aan - Onderwerp</h2>";

$counter = 1;
foreach ($emails['emails']['email'] as $email) {
    echo "$counter. {$email['naam']} - {$email['verstuurenAan']} – {$email['onderwerp']}<br>";
    $counter++;
}
?>