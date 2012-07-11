<?php
  error_reporting(0);
  header('Content-Type: application/json');

  if (empty($_POST['username']) || empty($_POST['password']) || empty($_POST['token'])) {
    die(json_encode(array('msg' => 'Hey! You need a username, password, and token!', 'debug' => '')));
  }

  $db = pg_connect('host=localhost port=5432 user=postgres dbname=multifactor_brahthentication');

  $query = "select * from users where username = '{$_POST['username']}' and password = '{$_POST['password']}' limit 1";

  if (($res = pg_query($db, $query)) === false) {
    $error = pg_last_error($db);
    pg_close($db);
    header('HTTP/1.1 500 Internal Server Error');
    die(json_encode(array('msg' => 'Something is FUCKED!', 'debug' => $error)));
  }

  if (pg_num_rows($res) === 0) {
    pg_free_result($res);
    pg_close($db);
    die(json_encode(array('msg' => 'Invalid username or password.', 'debug' => $query)));
  }

  $rows = pg_fetch_all($res);

  $fp = popen("../insecurid", "r");
  $out = fread($fp, 100);
  pclose($fp);

  if (($res = preg_match("/([0-9a-f]{40})/m", $out, $matches)) === false) {
    header('HTTP/1.1 500 Internal Server Error');
    die(json_encode(array('msg' => 'Something is broken for realz. Tell us!')));
  }

  if ($_POST['token'] !== $matches[1])
    die(json_encode(array('msg' => 'Your InsecurID token is invalid.', 'debug' => $rows)));

  echo json_encode(array('msg' => 'The flag is: fbb0a2fb8ca21c86c099f8dfe2b89c2e74790d31'));
?>
