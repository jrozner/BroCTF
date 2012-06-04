#!/usr/bin/php
<?php

function dba_fetch_assoc($handle) {
    $assoc = array();
    for($k = dba_firstkey($handle); $k != false; $k = dba_nextkey($handle)) {
        $assoc[$k] = dba_fetch($k, $handle);
        echo("\$k: $k, \$assoc[\$k]: " . $assoc[$k] . "\n");
    }
    return $assoc;
}

$dbHandle = dba_open('brotips.db', 'r', 'db4');

if(!$dbHandle) {
    echo("something went horribly wrong opening the brotips.db file!\nExiting..\n");
    exit(1);
}

print_r(dba_fetch_assoc($dbHandle));

dba_close($dbHandle);
?>
