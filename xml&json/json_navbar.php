<!DOCTYPE html>
<html lang="nl">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON Navigatiebalk</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
        }

        .navbar {
            background-color: #333;
            color: white;
            padding: 10px 0;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        .nav-menu {
            display: flex;
            list-style: none;
        }

        .nav-menu li {
            margin-right: 20px;
        }

        .nav-menu a {
            color: white;
            text-decoration: none;
            font-size: 18px;
            padding: 5px 10px;
            border-radius: 3px;
            transition: background-color 0.3s;
        }

        .nav-menu a:hover {
            background-color: #555;
        }

        .content {
            margin-top: 20px;
            padding: 20px;
        }
    </style>
</head>

<body>
    <nav class="navbar">
        <div class="container">
            <?php

            $jsonFile = 'navmenu.json';
            $jsonString = file_get_contents($jsonFile);


            $menuItems = json_decode($jsonString, true);



            echo '<ul class="nav-menu">';


            foreach ($menuItems as $item) {
                echo '<li><a href="' . $item['url'] . '">' . $item['title'] . '</a></li>';
            }

            echo '</ul>';
            ?>
        </div>
    </nav>

</body>

</html>