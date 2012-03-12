#!/usr/bin/php
<?php

/* This script will insert the key into the scraped db. */

$dbHandle = dba_open('brotips.db', 'n', 'db4');
if(!$dbHandle) {
    echo("something went horribly wrong opening the brotips.db file!\nExiting..\n");
    exit(1);
}

// Insert the key
if(!dba_insert('key', '642f0e6de607b1b62a0e979df633340255d2f0eb', $dbHandle)) {
    echo("Crap, bailed on inserting key\n");
} else {
    echo("stored key\n");
}


// Clean up and close
dba_optimize($dbHandle);
dba_sync($dbHandle);
dba_close($dbHandle);

?>
