<?php
// autoload
include 'vendor/autoload.php';
// class upload
include 'class.upload.php';

// NotORM
$dsn      = "mysql:dbname=db_phonecat;host=localhost";
$username = "root";
$password = "root";
$pdo = new PDO($dsn, $username, $password);
$db  = new NotORM($pdo, new NotORM_Structure_Convention(
    $primary = "%s_id", // $table_id
    $foreign = "%s_id", // $table_id
    $table   = "%ss" 	// {$table}s
));

// SLIM REST API
Slim\Slim::registerAutoLoader();
$app = new Slim\Slim();

$upload_directory = '../img/uploads';
$app->get('/test', function() use($app, $db, $upload_directory){
	$handle = new upload('D:/WampDeveloper/Websites/dev.angularjs/webroot/dummy/dummy problem.jpg');
	// $handle->file_new_name_body = 'image_resized';
	$handle->file_safe_name   = true;
	$handle->file_overwrite   = true;
	$handle->image_resize     = true;
	$handle->image_ratio_crop = true;
	$handle->image_x          = 800;
	$handle->image_y          = 600;
    $handle->process('D:/WampDeveloper/Websites/dev.angularjs/webroot/dummy/');
    if ($handle->processed) {
        echo 'image resized';
        $image_name = $handle->file_dst_name_body . '.' . $handle->file_dst_name_ext;
        // insert
        $result = $db->images()->insert(array(
        	'phone_id'   => 1,
        	'image_name' => $image_name,
        ));
        // get last id 
        // echo $result['image_id'];

        $image = array(
        	'filename' => $handle->file_dst_name_body,
			'url' 	=> 'http://dev.angularjs/dummy/' . $image_name,
			'image' => array(
				'dimensions' => array(
					'width'  => $handle->image_x, 
					'height' => $handle->image_y
				), 
				'mime' => $handle->file_src_mime
			)
        );
        echo '<pre>';
        echo print_r($result['image_id'], 1);
        echo print_r($image, 1);
        echo '<pre>';
        $handle->clean();
    } else {
        echo 'error : ' . $handle->error;
    }
});

$upload = array(
	'dir' => 'D:/WampDeveloper/Websites/dev.angularjs/webroot/_learn_/angularjs-resolve-page-transition/img/uploads/',
	'url' => 'http://dev.angularjs/_learn_/angularjs-resolve-page-transition/img/uploads/'
	// 'dir' => 'D:/WampDeveloper/Websites/dev.angularjs/webroot/dummy/',
	// 'url' => 'http://dev.angularjs/dummy/'
);

$app->get('/images/:phone_id', function ($phoneId) use ($app, $db, $upload) {
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

$app->post('/images/:imageId', function($imageId) use ($app, $db, $upload){
    $app->response()->header("Content-Type", "application/json");

	// check file
	if(!isset($_FILES['file'])) throw new Exception('File Upload required');
	if($_FILES['file']['error'] != 0) throw new Exception('File Upload error');

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

$app->delete('/images/:imageId', function ($imageId) use ($app, $db, $upload) {
    $app->response()->header("Content-Type", "application/json");

	$image = $db->images[$imageId];
	$imageFile = $upload['dir'] . $image['image_name'];
	if( file_exists($imageFile) )
		unlink($imageFile);

	echo json_encode($image->delete());
});
/*
 * REST API UPLOAD
 * 
 * @return JSON
 */
$app->post('/uploads', function() use ($app, $db, $upload) {
	$app->response()->header('Content-Type', 'application/json');
	try
	{
		$action = $_REQUEST['action'];
		$name   = $_REQUEST['name'];

		if(!isset($action)) throw new Exception('Action required');

		if( $action == 'chunk' )
		{
			// file index
			$index = $_REQUEST['index'];
			// check file name
			if(!isset($name)) throw new Exception('Filename required');
			if(!preg_match('/^[-a-z0-9_][-a-z0-9_.]*$/i', $name)) throw new Exception('Filename invalid');
			// check file index
			if(!isset($index)) throw new Exception('File index required');
			if(!preg_match('/^[0-9]+$/', $index)) throw new Exception('File index invalid');
			// check file
			if(!isset($_FILES['file'])) throw new Exception('File Upload required');
			if($_FILES['file']['error'] != 0) throw new Exception('File Upload error');
			// set upload destination for chunk files (index sufix)
			$target = $upload['dir'] . DIRECTORY_SEPARATOR . $name . '-' . $index;
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
			if(!isset($name)) throw new Exception('Filename required');
			if(!preg_match('/^[-a-z0-9_][-a-z0-9_.]*$/i', $name)) throw new Exception('Filename invalid');
			// check file index
			if(!isset($_REQUEST['index'])) throw new Exception('File index required');
			if(!preg_match('/^[0-9]+$/', $_REQUEST['index'])) throw new Exception('File index invalid');
			// get file image
			$target = $upload['dir'] . DIRECTORY_SEPARATOR . $name;
			// merging file
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

			// image info
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
		else throw new Exception('Access forbidden');
	}
	catch(Exception $e){
		$app->halt(500, $e->getMessage());
	}
});

$app->run();
