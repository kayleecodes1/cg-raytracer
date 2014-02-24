<?php

// Collect the file information
$fileName = $_FILES['file']['name'];
$fileTempName = $_FILES['file']['tmp_name'];
$fileError = $_FILES['file']['error'];

// The list of valid extensions
$validExtensions = array('txt', 'tri');

// Make sure the file is uploaded without
// errors and has a valid extension
if($fileError == UPLOAD_ERR_OK &&
	is_uploaded_file($fileTempName) &&
	in_array(end(explode('.', strtolower($fileName))),
		$validExtensions))
{
	// Print out the file contents
	echo file_get_contents($fileTempName); 
}
// The file is not valid
else
{
	// Report that there was an error
	echo 'error';
}

?>