// Brocabulator
//
// Give it a word, it brocabularizes it, and returns it to you.
// Has a format string vuln here to allow you to read down the stack.
//
// #include <string>
// #include <iostream>
// #include <cstdio>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include "libjack3d.h"

#define USER "broseph"
#define PORT 8008
#define BROMANCE "/usr/lib/brocabulary/bro"
#define WORDLEN 129

int translate( int );

int main( int argc, char **argv ) {

    // Create a socket, daemonize, and then fork() off to
    // the function pointer for translate() as the entry point.
    int socket;
    daemonize( USER );
    if ((socket = initListener(NULL, PORT)) == -1) {
        return 1;
    }
    return startService(&translate, socket);
}

int translate( int socket ) {
    // Payload here.
    char brocabulary[WORDLEN];
    char supstack[2048];
    int res = 0;
    volatile char *broskey = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
    sendString( socket, "Sup bro?\n" );
    while( 1 ) {
        sendString( socket, "\nWhat's the word?\n>>> " );
        if (( res = recvUntil( socket, brocabulary, sizeof( brocabulary ) - 1, '\n') ) == 0 ) {
            fprintf(stderr, "No datas!\n");
            close(socket);
            return 1;
        }
        
        sprintf( supstack, brocabulary );   // vulnerable!
        volatile char *broskey = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
        sendString( socket, supstack );
    }
    close( socket );
    return 0;
}