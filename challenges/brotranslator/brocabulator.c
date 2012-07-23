// Brocabulator
//
// Give it a word, it brocabularizes it, and returns it to you.
// Has a format string vuln here to allow you to read down the stack.
//
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include "libjack3d.h"

#define USER "broseph"
#define PORT 8008
#define BROMANCE "/usr/lib/brocabulary/bro"
#define WORDLEN 300

int translate(int);

int main(int argc, char **argv) {

    // Create a socket, daemonize, and then fork() off to
    // the function pointer for translate() as the entry point.
    int socket;
    daemonize(USER);
    if ((socket = initListener(NULL, PORT)) == -1) {
        return 1;
    }
    return startService(&translate, socket);
}

int translate(int socket) {
    int res = 0;
    FILE *fp;
    char brocabulary[WORDLEN];
    char broskey[41];

    if ((fp = fopen("flag.txt", "r")) == NULL) {
      perror("fopen");
      close(socket);
      return 1;
    }

    if (fgets((char *)&broskey, sizeof(broskey), fp) == NULL) {
      perror("fgets");
      close(socket);
      return 1;
    }

    fclose(fp);

    sendString( socket, "Sup bro?\n" );
    while (1) {
        sendString( socket, "\nWhat's the word?\n>>> " );

        if ((res = recvUntil(socket, brocabulary, sizeof(brocabulary) - 1, '\n')) == 0) {
            fprintf(stderr, "No datas!\n");
            close(socket);
            return 1;
        }

        dprintf(socket, brocabulary); // NICE. Vulerable output direct to a socket.
    }

    close(socket);
    return 0;
}
