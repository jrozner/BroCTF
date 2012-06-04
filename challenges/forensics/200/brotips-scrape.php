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

// Make sure we have the necessary stuff..
if(!function_exists('dba_open')) {
    echo ("Can't load the PHP DBA methods.\nyum -y install php-dba\n");
    exit(2);
}

if(!function_exists('curl_init')) {
    echo("Can't load PHP curl methods.  Sum ting wong.\n");
    exit(2);
}


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
        // Don't even waste time here if we're not inside of the correct url.
        return(0);
    }
    // debug why the fuck it's getting weird parses.
    file_put_contents("brotips-scrape-tip$tipID.html", $content);
    foreach($html as $lineNum => $line) {

        // Prior to tip 1441, all tips were single line.  Detect them specially.
        if($tipID < 1441) {
            if(preg_match('/<meta property="og:description" content="(.+)"\s\/>$/', $line, $matches)) {
                $tip = $matches[1];
            }
        } else {

            // After tip 1442, the tips are multiline, so a little extra care is needed.
            preg_match('/<meta property="og:description" content=("[\s\w\d,.-_!;&%\']+)/', $line, $matches);
            $tip = $matches[1] . " ";
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
//$topTip = 1978;
$topTip = 10; // Use this for testing.

// Perform scraping.  note that there's no way to randomize the wait
// between requests that I can find.  Maybe I'll extend that class?
for( $i=1; $i <= $topTip; ++$i ) {
    $pcurl->startRequest("http://www.brotips.com/${i}", 'store_tip', false);
}
$pcurl->finishAllRequests();

// Here's where we write the DB4 database.
$dbHandle = dba_open('brotips.db', 'n', 'db4');
if(!$dbHandle) {
    echo("something went horribly wrong opening the brotips.db file!\nExiting..\n");
    exit(1);
}

// Since DB4 is being pile of poo, lets also try CSV as a backup.
$writeTipsCSV = True;
if(! $csvHandle = fopen( 'brotips.csv', 'w' ) ) {
	echo "Fffuuuu unable to open brotips.csv file..  ";
	$writeTipsCSV = False;
}

foreach($bro_tips as $tipID => $tipData) {
    echo("\$tipID: $tipID\n");
    print_r($tipData);
    if(!dba_insert($tipID, sprintf("%d,%s",$tipData['count'],$tipData['tip']), $dbHandle)) {
        echo("Crap, bailed on inserting id: $tipID\n");
        echo("Data..\n");
        print_r($tipData);
    } else {
        echo("stored tip ID: $tipID\n");
    }
	if($writeTipsCSV) {
      $csvTip = array($tipID,$tipData['count'],$tipData['tip']);
		fputcsv($csvHandle, $csvTip, "\t", '"' );
	}
}

// Clean up and close
dba_optimize($dbHandle);
dba_sync($dbHandle);
dba_close($dbHandle);
fclose($csvHandle);

?>
