#!/usr/bin/php
<?php

// Here's where we write the DB4 database.
$dbHandle = dba_open('brotips.db', 'n', 'db4');
if(!$dbHandle) {
    echo("something went horribly wrong opening the brotips.db file!\nExiting..\n");
    exit(1);
}

// load the CSV file for output
$dbFile = 'brotips.csv';
if(! $csvHandle = fopen( $dbFile, 'r' ) ) {
   echo "Fffuuuu unable to open '$dbFile' file..  ";
	exit(1);
} else {
	$bro_tips = array();
	$tip = array();
	while ( $tip = fgetcsv( $csvHandle, 0, "\t", '"' ) ) {
		array_push( $bro_tips, $tip );
	}
}

foreach($bro_tips as $tipData) {
    $tipInsert = sprintf("%d,%s",$tipData[1],$tipData[2]);
    $tipID = $tipData[0];
    if(!dba_insert($tipID, $tipInsert, $dbHandle)) {
        echo("Crap, bailed on inserting id: $tipID\n");
    } else {
        echo("stored tip ID: $tipID\n");
    }
}

// Clean up and close
dba_optimize($dbHandle);
dba_sync($dbHandle);
dba_close($dbHandle);
fclose($csvHandle);

?>
