#!/usr/bin/php
<?php

$stdin = fopen('php://stdin', 'r');
$infile = fread($stdin,1024000);
echo(bin2hex($infile));

?>
