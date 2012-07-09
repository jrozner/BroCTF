<?php
  header('Content-Type: application/json');
  $decoded = base64_decode($_POST['file']);
  $filename = sha1(time()+mt_rand());
  file_put_contents("/tmp/images/".$filename, $decoded);
  echo json_encode(array('msg' => "Your file's name is: ".$filename));
?>
