#!/usr/bin/php
<?php

$html = explode("\n", file_get_contents('brotips-test.html'));
$tip = '';
foreach($html as $lineNum => $line) {
	if(preg_match('/<meta property="og:description" content=("[\w\d,.-_! ]*)/', $line, $matches)) {
		$tip .= $matches[1] . " ";
		$nextLine = $lineNum;
		++$nextLine;
		while(!preg_match("/\/>$/",$html[$nextLine])) {
			$tip .= $html[$nextLine] . " ";
			++$nextLine;
		}
		$tip .= rtrim($html[$nextLine],"\"/>");
		break;
	}
}

$tip2 = rtrim($tip);

echo("$tip2");

?>

