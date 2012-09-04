<?php

require "movie-library/config.php";

var_dump( Config::$DB->query("PRAGMA table_info(movie_library)")->fetchAll(PDO::FETCH_ASSOC) );