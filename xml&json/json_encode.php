<?php
header('Access-Control-Allow-Origin: *');
header('Content-type: application/json');

$klas = (object) [
    "Studenten" => [
        (object) ["naam" => "Jan", "plaats" => "Tilburg",],
        (object) ["naam" => "Piet", "plaats" => "Tilburg",],
        (object) ["naam" => "Klaas", "plaats" => "Goirle",],
        (object) ["naam" => "Anneloes", "plaats" => "Tilburg"],
        (object) ["naam" => "Marlies", "plaats" => "Oisterwijk"]
    ]
];

echo json_encode($klas, JSON_PRETTY_PRINT);

foreach ($klas->Studenten as $student) {
    if ($student->plaats == "Tilburg") {
        echo json_encode($student, JSON_PRETTY_PRINT);
    }
}
?>