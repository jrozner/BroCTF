#!/usr/bin/php
<?php

$html = explode("\n", file_get_contents('brotips-test.html'));
$tip = '';
$count = 0;
foreach($html as $lineNum => $line) {

    // Prior to tip 1441, all tips were single line.  Detect them specially.
    if(preg_match('/<meta property="og:description" content=("[\w\d,.-_! ]*")[\s]*\/>$/', $line, $matches)) {
        $tip .= $matches[1];
    }

    // After tip 1442, the tips are multiline, so a little extra care is needed.
    elseif(preg_match('/<meta property="og:description" content=("[\w\d,.-_! ]+)/', $line, $matches)) {
		$tip .= $matches[1] . " ";
		$nextLine = $lineNum;
		++$nextLine;
		while(!preg_match("/\/>$/",$html[$nextLine])) {
			$tip .= $html[$nextLine] . " ";
			++$nextLine;
		}
		$tip .= rtrim($html[$nextLine],"\"/>");
	}

    // Don't forget to grab the fist count too, just in case.
    if(preg_match('/<div class="count">([\d]{1,10})<\/div>/', $line, $matches)) {
        $count = (int)$matches[1];
    }
}

echo("\$count: $count, \$tip: $tip");

?>

