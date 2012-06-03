#!/usr/bin/php
<?php

$multi = explode("\n", file_get_contents('brotips-test-1964.html'));
$single = explode("\n", file_get_contents('brotips-test-1000.html'));

function parse_tip( $html ) {
    $tip = '';
    foreach($html as $lineNum => $line) {
        // Prior to tip 1441, all tips were single line.  Detect them specially.
        if(preg_match('/<meta property="og:description" content=("[\s\w\d,.-_!;&%\']*")[\s]*\/>$/', $line, $matches)) {
            $tip = $matches[1];
        }

        // After tip 1442, the tips are multiline, so a little extra care is needed.
        elseif(preg_match('/<meta property="og:description" content=("[\s\w\d,.-_!;&%\']+)/', $line, $matches)) {
            $tip .= $matches[1] . " ";
            $nextLine = $lineNum;
            ++$nextLine;
            while(!preg_match("/\"\s\/>$/",$html[$nextLine])) {
                $tip .= $html[$nextLine] . " ";
                ++$nextLine;
            }
            $tip .= rtrim($html[$nextLine],"\" />");
        }

        // Don't forget to grab the fist count too, just in case.
        if(preg_match('/<div class="count">([\d]{1,10})<\/div>/', $line, $matches)) {
            $count = (int)$matches[1];
				echo ("Fistcount: $count\n");
        }
    }

	return $tip;
}

$multiTip = parse_tip($multi);
$singleTip = parse_tip($single);

echo("Multi:\n");
print_r($multiTip);
echo("\n");
echo("single:\n");
print_r($singleTip);
echo("\n");



?>
