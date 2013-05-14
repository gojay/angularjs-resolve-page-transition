<?php
// autoload
include 'vendor/autoload.php';
// class upload
include 'class.upload.php';

// NotORM
$dsn      = "mysql:dbname=db_phonecat;host=localhost";
$username = "root";
$password = "";
$pdo = new PDO($dsn, $username, $password);
$db  = new NotORM($pdo, new NotORM_Structure_Convention(
    $primary = "%s_id", // $table_id
    $foreign = "%s_id", // $table_id
    $table   = "%ss" 	// {$table}s
));

// SLIM REST API
Slim\Slim::registerAutoLoader();
$app = new Slim\Slim();

/*
 * Image Dimensions
 */
$imgDimensions = array(
	'small' => array(
		'x' => 124,
		'y' => 98
	),
	'medium' => array(
		'x' => 300,
		'y' => 200
	)
);

$upload_directory = '../img/uploads';
$app->get("/image", function () use ($app, $db, $upload_directory) {
    $app->response()->header("Content-Type", "application/json");

	$images = glob($upload_directory . "/{*.jpg,*.gif,*.png}", GLOB_BRACE);
	$json   = json_encode($images);

    $cb = isset($_GET['callback']) ? $_GET['callback'] : false;
    if($cb) $json = "$cb($json)";
	
    echo $json;
});
$app->delete("/image/:id", function ($id) use ($app, $db, $upload_directory) {
    $app->response()->header("Content-Type", "application/json");

	$images = glob($upload_directory . "/{*.jpg,*.gif,*.png}", GLOB_BRACE);
	$json   = json_encode($images);

    $cb = isset($_GET['callback']) ? $_GET['callback'] : false;
    if($cb) $json = "$cb($json)";
	
    echo $json;
});
/*
 * REST API UPLOAD
 * 
 * @return JSON
 */
$app->post('/upload', function() use ($app, $imgDimensions) {
	$app->response()->header('Content-Type', 'application/json');
	// for img purchase
	$showImgNameOnly = false;
	try
	{
		// define files
		$fileImg  = $_FILES['file']['tmp_name'];
		$fileName = $_FILES['file']['name'];
		$fileType = $_FILES['file']['type'];
		$ext  = pathinfo($fileName, PATHINFO_EXTENSION);
		
		// create new picture name
		$name = str_replace('-', '_', $_REQUEST['name']);
		// set image size
		$size = array();
		if(preg_match('/logo/i', $name))
			$size = $imgDimensions['logo'];
		elseif(preg_match('/banner/i', $name))
			$size = $imgDimensions['banner'];
		elseif(preg_match('/price/i', $name))
			$size = $imgDimensions['price'];
		elseif(preg_match('/quiz/i', $name))
			$size = $imgDimensions['quiz'];
		elseif(preg_match('/purchase/i', $name)){
			$size = $imgDimensions['purchase'];
			$showImgNameOnly = true;
		}
		else
			throw new ForbiddenException("Unknown image file");
		
		// create a unique prefix name of the image
		// Add: constest ID 
		// Update: REQUEST ID
		if( isset($_REQUEST['id']) ){
			$ID = $_REQUEST['id'];
		} 
		else {
			$ID = Contests::getInstance()->getNextID();
		}
		
		// create image name
		$newName = $ID . '_' . $name;
		if( $showImgNameOnly ){
			$uniqueID = Contestants::getInstance()->getNextID();
			$newName .= '_' . $uniqueID;
		}
		$picName = $newName . '.' . $ext;
		// remove old image
		$oldPic = CONTEST_UPLOAD_DIR . '/' . $picName;
		if ( file_exists($oldPic) ) { 
			unlink($oldPic);
		}
		
		// do upload n resize
		$imagehand = new upload( $fileImg );
		$imagehand->file_dst_name_ext = $ext;
		$imagehand->file_new_name_body = $newName;
		$imagehand->image_resize = true;
		$imagehand->image_ratio_crop  = true;
		$imagehand->image_x = $size['x'];
		$imagehand->image_y = $size['y'];
		$imagehand->image_convert = $ext;
		$imagehand->Process(CONTEST_UPLOAD_DIR);
		if( !$imagehand->processed ) throw new ForbiddenException("Error upload $fileName");
		
		$fileURL = ($showImgNameOnly) ? $picName : CONTEST_UPLOAD_URL . '/' . $picName;
		$json = json_encode(array(
			'url'  => $fileURL,
			'size' => $_FILES['file']['size']
		));
        $cb = isset($_GET['callback']) ? $_GET['callback'] : false;
        if($cb) $json = "$cb($json)";
		
		sleep(1);
		
        echo $json;
		
	}
	catch(Exception $e){
		$app->halt(500, $e->getMessage());
	}
});

$app->run();
?>