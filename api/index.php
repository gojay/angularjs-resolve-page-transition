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

// http://nurkiewicz.blogspot.com/2013/03/promises-and-deferred-objects-in-jquery.html
// http://stackoverflow.com/questions/6538470/jquery-deferred-waiting-for-multiple-ajax-requests-to-finish
$app->post('/convert/:phone', function($phone) use ($app, $db){
	$fileJSON = '../phones/' . $phone . '.json';
	if(!file_exists($fileJSON)) throw new Exception('file not found');

	$json = json_decode(file_get_contents($fileJSON));
	$json->images = array_map('getFileName', $json->images);

	$data = objectToArray($json, true);

	$phone_columns = array('id','name', 'description');
	$arr['phones']    = array_intersect_key($data, array_flip($phone_columns));
	$arr['phonemeta'] = array_diff_key($data, array_flip($phone_columns));

	$phones = $db->phones()->insert(array(
		'phone_title' 		=> $arr['phones']['id'],
		'phone_name'  		=> $arr['phones']['name'],
		'phone_description' => $arr['phones']['description'],
		'phone_date'  		=> date('Y-m-d H:i:s')
	));
	foreach ($arr['phonemeta'] as $key => $value) {
		$phones->phonemeta()->insert(array(
			'meta_name'  => $key,
			'meta_value' => $value
		));
	}
});

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
