<?php
// Autoload
include 'vendor/autoload.php';
// class Exception
include 'Exception.php';
// class DB NotORM
include 'db/config.php';
// class API
include 'RestApiInterface.php';

// upload configuration
$upload = array(
	// 'dir' => 'D:/WampDeveloper/Websites/dev.angularjs/webroot/_learn_/angularjs-resolve-page-transition/img/uploads/',
	'dir' => 'D:/Development/AngularJS/_learn_/angularjs-resolve-page-transition/img/uploads/',
	'url' => 'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/img/uploads/'
);

// SLIM REST API
Slim\Slim::registerAutoLoader();
$app = new Slim\Slim();

$app->get('/superheroes', function() use($app){
    $app->response()->header("Content-Type", "application/json");
	echo json_encode(array(
			'marvel' => 'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/marvel',
			'dc' => 'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/dc',
			'manga' => 'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/manga'
	));
});
$app->get('/dc', function() use($app){
    $app->response()->header("Content-Type", "application/json");
	echo json_encode(array(
		'Batman' => 'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/character/batman',
		'Superman' => 'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/character/superman',
		'Justice League' => 'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/character/justice-league'
	));
});
$app->get('/marvel', function() use($app){
    $app->response()->header("Content-Type", "application/json");
	echo json_encode(array(
		'X-Men' => 'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/character/x-men',
		'The Avengers' => 'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/character/avengers',
		'Fantastic Four' => 'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/character/f4',
		'Spiderman' => 'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/character/spiderman',
	));
});
$app->get('/manga', function() use($app){
    $app->response()->header("Content-Type", "application/json");
	echo json_encode(array(
		'Dragon Ball' => 'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/character/dragon-ball',
		'Naruto' => 'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/character/naruto'
	));
});
$app->get('/character/:value', function($value) use($app){
    $app->response()->header("Content-Type", "application/json");
    $characters = array();
    switch($value){
    	case 'x-men':
    		$characters = array('Wolverine', 'Storm', 'Cyclops', 'Jane');
    		break;
    	case 'avengers':
    		$characters = array('Thor', 'Captain America', 'Iron Man', 'Hulk');
    		break;
    	case 'f4':
    		$characters = array('Richards', 'Sue', 'Johnny', 'Ben');
    		break;
    	case 'spiderman':
    		$characters = array('Spiderman', 'Venom', 'Lizard', 'Doctor Octopus');
    		break;
    	case 'batman':
    		$characters = array('Bruce Wayne', 'Robin', 'Joker', 'Bane');
    		break;
    	case 'superman':
    		$characters = array('Clark Kent', 'Lex Luthor', 'Kryptonite Man');
    		break;
    	case 'flash':
    		$characters = array('Richards', 'Sue', 'Johnny', 'Ben');
    		break;
    	case 'justice-league':
    		$characters = array('superman', 'Batman', 'Wonder Woman', 'Flash');
    		break;
    	case 'dragon-ball':
    		$characters = array('Songoku', 'Bezita', 'Ceil', 'Buu');
    		break;
    	case 'naruto':
    		$characters = array('Naruto', 'Kakashi', 'Sasuke', 'Flash');
    		break;
    }
	echo json_encode($characters);
});

function objectToArray($obj, $serialized = false) 
{
    $arrObj = is_object($obj) ? get_object_vars($obj) : $obj;
    foreach ($arrObj as $key => $val) {
        $val = (is_array($val) || is_object($val)) ? objectToArray($val) : $val;
        $arr[$key] = $serialized
        				? (is_array($val) ? serialize($val) : htmlentities($val, ENT_QUOTES, "utf-8"))
        				: (is_array($val) ? $val : htmlentities($val, ENT_QUOTES, "utf-8")) ;
    }
    return $arr;
}  

function getFileName($url){
	return basename($url);
}

$app->get('/promises', function() use($app){
    $app->response()->header("Content-Type", "application/json");
	echo json_encode(array(
		'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/promise/1',
		'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/promise/2',
		'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/promise/3',
		'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/promise/4',
		'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/api/promise/5',
	));
});
$app->get('/promise/:value', function($value) use($app){
    $app->response()->header("Content-Type", "application/json");
	sleep(3);
	echo json_encode(array('response' => $value));
});

$app->get('/phones', function() use ($app){
	$phones = array();
	$dir = dirname(dirname(__FILE__)) . '/phones';
	foreach (glob($dir.'/*.json') as $key => $filename) {
		$file = basename($filename);
		if(preg_match('/phones/', $file)) continue;
		array_push($phones, basename($file));
	}
	sleep(3);
	echo json_encode($phones);
});

$app->post('/convert/:phone', function($phone) use ($app, $db){
	$fileJSON = '../phones/' . $phone;
	try{
		if(!file_exists($fileJSON)) throw new Exception('file not found');

		$json = json_decode(file_get_contents($fileJSON));
		$json->images = array_map('getFileName', $json->images);

		$data = objectToArray($json, true);

		$phone_columns = array('id','name', 'description');
		$phone_meta    = array_diff_key($data, array_flip($phone_columns));
		$phone_images  = array('images');
		$arr['phones']    = array_intersect_key($data, array_flip($phone_columns));
		$arr['phonemeta'] = array_diff_key($phone_meta, array_flip($phone_images));
		$arr['images']    = array_intersect_key($phone_meta, array_flip($phone_images));

		$phone = $db->phones()->insert(array(
			'phone_title' 		=> $arr['phones']['id'],
			'phone_name'  		=> $arr['phones']['name'],
			'phone_description' => $arr['phones']['description'],
			'phone_date'  		=> date('Y-m-d H:i:s')
		));
		if($arr['phonemeta']){
			foreach ($arr['phonemeta'] as $key => $value) {
				$phone->phonemeta()->insert(array(
					'phone_id'	 => $phone['phone_id'],
					'meta_name'  => $key,
					'meta_value' => $value
				));
			}
		}
		if($arr['images']){
			foreach ($arr['images'] as $value) {
				$phone->images()->insert(array(
					'phone_id'	 => $phone['phone_id'],
					'image_name' => $value
				));
			}
		}

		sleep(3);

		echo json_encode(array(
			'status' => true,
			'phone_id' => $phone['phone_id'],
			'message' => 'Success ' . $arr['phones']['name']
		));
	}
	catch(Exception $e){
		echo json_encode(array(
			'status' => false,
			'message' => 'Error  ' . $e->getMessage()
		));
	}
	
});

/* images */

$app->get('/phone/images/:phone_id', function ($phoneId) use ($app, $db, $upload) {
    $app->response()->header("Content-Type", "application/json");

    $images = $db->images->where('phone_id = ?', $phoneId);
    $data   = array();
	foreach($images as $image) {
		$imageFile = $upload['dir'] . $image['image_name'];
		$pathinfo  = pathinfo($imageFile);
		$imageInfo = getimagesize($imageFile);
		$data[] = array(
			'id'   => (int) $image['image_id'],
			'name' => $pathinfo['filename'],
			'url' 	=> $upload['url'] . $image['image_name'],
			'image' => array(
				'dimensions' => array(
					'width'  => $imageInfo[0], 
					'height' => $imageInfo[1]
				)
			)
		);
	}

	echo json_encode($data);
});

$app->post('/phone/images/:imageId', function($imageId) use ($app, $db, $upload){
    $app->response()->header("Content-Type", "application/json");

	// check file
	if(!isset($_FILES['file'])) throw new ValidationException('File not found');
	if($_FILES['file']['error'] != 0) throw new ValidationException('File error');

	// define files
	$fileImg  = $_FILES['file']['tmp_name'];
	$fileName = $_FILES['file']['name'];

	// unlink image
    $image = $db->images[$imageId];
	$imageFile = $upload['dir'] . DIRECTORY_SEPARATOR . $image['image_name'];
	if(file_exists($imageFile)){
		unlink($imageFile);
	}

	// set target
	$target     = $upload['dir'] . DIRECTORY_SEPARATOR . $fileName;
	// set url
	$target_url = $upload['url'] . $fileName;

	// upload file
	if( move_uploaded_file($fileImg, $target) ){
		// update db
		$result = $image->update(array(
	    	'phone_id'   => $phoneId,
	    	'image_name' => $fileName,
	    ));
		// create output data
		// image info
		$imageInfo  = getimagesize($target);
		$data = array(
			'name'  => $fileName,
			'url'   => $target_url,
			'image' => array(
				'dimensions' => array(
					'width'  => $imageInfo[0], 
					'height' => $imageInfo[1]
				) 
			)
		);
		// make emulate
		sleep(3);
		// send output
		echo json_encode($data);
	}
	else throw new Exception('Error uploading file');
});

$app->delete('/phone/images/:imageId', function ($imageId) use ($app, $db, $upload) {
    $app->response()->header("Content-Type", "application/json");

	$image = $db->images[$imageId];
	$imageFile = $upload['dir'] . $image['image_name'];
	if( file_exists($imageFile) )
		unlink($imageFile);

	echo json_encode($image->delete());
});

$app->post('/uploads', function() use ($app, $db, $upload) {
	$app->response()->header('Content-Type', 'application/json');
	try
	{
		$action = $_REQUEST['action'];
		$name   = $_REQUEST['name'];

		if(!isset($action)) throw new ForbiddenException('Action required');

		if( $action == 'chunk' )
		{
			// file index
			$index = $_REQUEST['index'];
			// check file
			if(!isset($_FILES['file'])) throw new ValidationException('File not found');
			if($_FILES['file']['error'] != 0) throw new ValidationException('File error');
			// check file name
			if(!isset($name)) throw new ValidationException('Filename required');
			if(!preg_match('/^[-a-z0-9_][-a-z0-9_.]*$/i', $name)) throw new ValidationException('invalid filename');
			// check file index
			if(!isset($index)) throw new ValidationException('File index required');
			if(!preg_match('/^[0-9]+$/', $index)) throw new ValidationException('invalid file index ');
			// set upload destination for chunk files (index sufix)
			$target = $upload['dir'] . $name . '-' . $index;
			// upload file
			move_uploaded_file($_FILES['file']['tmp_name'], $target);
			// make emulate
			sleep(3);
			// send output
			echo json_encode($_FILES);
		}
		elseif( $action == 'merge' ) 
		{
			// check file name
			if(!isset($name)) throw new ValidationException('Filename required');
			if(!preg_match('/^[-a-z0-9_][-a-z0-9_.]*$/i', $name)) throw new ValidationException('invalid filename');
			// check file index
			if(!isset($_REQUEST['index'])) throw new Exception('File index required');
			if(!preg_match('/^[0-9]+$/', $_REQUEST['index'])) throw new ValidationException('invalid file index ');
			// get file image
			$target = $upload['dir'] . DIRECTORY_SEPARATOR . $name;
			// merging files
			$dst = fopen($target, 'wb');
			for($i = 0; $i < $_REQUEST['index']; $i++) 
			{
				$slice = $target . '-' . $i;
				$src   = fopen($slice, 'rb');
			    stream_copy_to_stream($src, $dst);
			    fclose($src);
			    unlink($slice);
			}
			fclose($dst);

			// get path & image info
			$pathinfo  = pathinfo($target);
			$imageInfo = getimagesize($target);
			// insert db
			$result = $db->images()->insert(array(
	        	'phone_id'   => 1,
	        	'image_name' => $pathinfo['basename'],
	        ));
			// create output data
			$data = array(
				'id'    => $result['image_id'],
				'name'  => $pathinfo['filename'],
				'url'   => $upload['url'] . $result['image_name'],
				'image' => array(
					'dimensions' => array(
						'width'  => $imageInfo[0], 
						'height' => $imageInfo[1]
					) 
				)
			);
			// send output
			echo json_encode($data);
		}
		else throw new ForbiddenException('Unknown action');
	}
	catch (ValidationException $e){
		$app->halt(400, $e->getMessage());
	}
	catch (ForbiddenException $e){
		$app->halt(403, $e->getMessage());
	}
	catch(Exception $e){
		$app->halt(500, $e->getMessage());
	}
});

$app->run();
