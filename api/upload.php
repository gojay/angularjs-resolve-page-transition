<?php
$upload_directory = '../img/uploads';

$action = $_REQUEST['action'];
if(!isset($action)) throw new Exception('Action required');

if( $action == 'get')
{
	$images = glob($upload_directory . "/{*.jpg,*.gif,*.png}", GLOB_BRACE);
	$data = array();
	foreach($images as $image){
		$data[] = $image;
	}
	header('Content-Type', 'application/json');
	echo json_encode((object)$data);
}
elseif( $action == 'chunk' )
{
	$name  = $_REQUEST['name'];
	$index = $_REQUEST['index'];

	if(!isset($name)) throw new Exception('Name required');
	if(!preg_match('/^[-a-z0-9_][-a-z0-9_.]*$/i', $name)) throw new Exception('Name error');
	
	if(!isset($index)) throw new Exception('Index required');
	if(!preg_match('/^[0-9]+$/', $index)) throw new Exception('Index error');
	
	if(!isset($_FILES['file'])) throw new Exception('Upload required');
	if($_FILES['file']['error'] != 0) throw new Exception('Upload error');
	
	$target = $upload_directory . "/" . $name . '-' . $index;
	
	move_uploaded_file($_FILES['file']['tmp_name'], $target);
	
	sleep(3);
	
	echo json_encode($_FILES);
}
elseif( $action == 'merge' ) 
{
	if(!isset($_REQUEST['name'])) throw new Exception('Name required');
	if(!preg_match('/^[-a-z0-9_][-a-z0-9_.]*$/i', $_REQUEST['name'])) throw new Exception('Name error');
	
	if(!isset($_REQUEST['type'])) throw new Exception('Type required');
	
	if(!isset($_REQUEST['index'])) throw new Exception('Index required');
	if(!preg_match('/^[0-9]+$/', $_REQUEST['index'])) throw new Exception('Index error');
	
	$target = $upload_directory . "/" . $_REQUEST['name'];
	$dst = fopen($target, 'wb');
	
	for($i = 0; $i < $_REQUEST['index']; $i++) 
	{
	    $slice = $target . '-' . $i;
	    $src = fopen($slice, 'rb');
	    stream_copy_to_stream($src, $dst);
	    fclose($src);
	    unlink($slice);
	}
	
	fclose($dst);
	
	// $fileType = $_REQUEST['type'];
	// $fileContent = file_get_contents(dirname(__FILE__) . '/' . $target);
	// $dataUri = 'data:' . $fileType . ';base64,' . base64_encode($fileContent);

	$pathinfo = pathinfo($target);
	echo json_encode(array(
		'image' => $target,
		'name'  => $pathinfo['filename']
	));
}
else throw new Exception('Access forbidden');
