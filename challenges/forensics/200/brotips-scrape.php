#!/usr/bin/php
<?php

/* brotips.com scraper.  Grabs all tips (TWSS) and shoves them in (TWSS)
 * to a DB4 table.  Tip ID is the key, the tip is the value.  Might also
 * parse out the number of fists.
 *
 * The URL to each tip is relatively simple: http://www.brotips.com/[\d]{1,4}
 *
 * The tip text itself is contained in a META tag at the beginning, so you
 * don't need to spend a lot of time parsing extra HTML.
 */


// Global data structure to hold the scraped tips
// that the callback will ask for.
$bro_tips = '';

/* Callback function to handle each tip URL
 * $content contains the data from the cURL scrape, that's
 * the one we care about.  $url was the URL that was
 * scraped (don't care), $ch is the cURL handle if you
 * need anything from it (don't care) and $params is anything
 * custom you want passed back from the main loop into the
 * callback.
 */
function store_tip($content, $url, $ch, $params) {
    global $bro_tips;
    $html = explode("\n", $content);
    $tip = '';
    $count = 0;
    if(preg_match('/brotips.com\/([\d]+)$/',$url, $matches)) {
        $tipID = $matches[1];
    } else {
        $tipID = -1;
    }
    foreach($html as $lineNum => $line) {

        // Prior to tip 1441, all tips were single line.  Detect them specially.
        if(preg_match('/<meta property="og:description" content=("[\s\w\d,.-_!;&]*")[\s]*\/>$/', $line, $matches)) {
            $tip .= $matches[1];
        }

        // After tip 1442, the tips are multiline, so a little extra care is needed.
        elseif(preg_match('/<meta property="og:description" content=("[\s\w\d,.-_!;&]+)/', $line, $matches)) {
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

    // Stuff them into the global associative array for later
    // assembly into a DB4 table.
    $bro_tips[$tipID] = array('tip'=>$tip,'count'=>$count);
}

// Set up synchronus cURL wrapper
require_once('parallelcurl.php');
$curl_options = array(
    CURLOPT_SSL_VERIFYPEER => FALSE,
    CURLOPT_SSL_VERIFYHOST => FALSE,
    CURLOPT_AUTOREFERER => TRUE,
    CURLOPT_FOLLOWLOCATION => TRUE,
    CURLOPT_MAXREDIRS => 3,
    CURLOPT_NOPROGRESS => TRUE
);

$maxConcurrent = 10;
$pcurl = new ParallelCurl($maxConcurrent,$curl_options);
// $topTip = 1693;
$topTip = 5;

for( $i=1; $i <= $topTip; ++$i ) {
    $pcurl->startRequest("http://www.brotips.com/${i}", 'store_tip', false);
}
$pcurl->finishAllRequests();

// Test?
foreach($bro_tips as $tipID => $tipData) {
    echo("\$tipID: $tipID\n");
    print_r($tipData);
}

// Here's where we write the DB4 database.

?>
