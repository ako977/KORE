<?php

//Config vars for project
define( 'DOCUMENT_ROOT', dirname(__DIR__) );

require DOCUMENT_ROOT."/../vendors/codeguy-Slim-18d6d03/Slim/Slim.php";

class Config 
{
	
	public static $RestApp;
	public static $DB;

	public static function initSlim()
	{
		self::$RestApp = new Slim();
	}

	public function __autoload( $class_name )
	{
		include DOCUMENT_ROOT.'/movie-library/classes/'.$class_name.'.php';
	}

	public static function initDatabase()
	{			
		self::$DB = new PDO( 'sqlite:'.DOCUMENT_ROOT.'/movie-library/movie-library-db.sq3', null, null );

		self::$DB->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		self::$DB->exec("CREATE TABLE IF NOT EXISTS movie_library (
                    id INTEGER PRIMARY KEY, 
                    title TEXT, 
                    format TEXT, 
                    length INTEGER,
                    rating INTEGER)");
	}
}

Config::initSlim();

Config::initDatabase();