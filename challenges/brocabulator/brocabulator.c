// Brocabulator
//
// Give it a word, it brocabularizes it, and returns it to you.
// Has a format string vuln here to allow you to read down the stack.
//
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <regex.h>

#include <sys/types.h>
#include <sys/wait.h>
#include <sys/socket.h>
#include <netinet/in.h>

#include "libjack3d.h"

#if !defined(USER)
    #error "You suck at life."
#endif

#if !defined(PORT)
    #define PORT 8008
#endif

#define WORDLEN 300

int translate(int);

int main(int argc, char **argv) {

    // Create a socket, daemonize, and then fork() off to
    // the function pointer for translate() as the entry point.
    int socket;
    if (!argv[1])
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
    char *safe, cmd[WORDLEN+50+1];
    char buf[WORDLEN+100+1];
    int i, j;

    /* /[bgpt]r[ola]/ */
    if ((fp = fopen("/usr/home/" USER "/flag.txt", "r")) == NULL) {
      perror("fopen");
      close(socket);
      return 1;
    }

    if (fgets(broskey, sizeof(broskey), fp) == NULL) {
      perror("fgets");
      close(socket);
      return 1;
    }

    fclose(fp);

    sendString( socket, "Sup bro?\n" );
    while (1) {
        sendString(socket, "\nWhat's the word?\n>>> ");

        if ((res = recvUntil(socket, brocabulary, sizeof(brocabulary) - 1, '\n')) == 0) {
            fprintf(stderr, "No datas!\n");
            close(socket);
            return 1;
        }

        /* +3 for single quoting the string */
        safe = calloc(1, res+3);
        safe[0] = '\'';
        for (i=0, j=1; i < res; i++) {
            switch(brocabulary[i]) {
                case '\\':
                case '\'':
                    break;
                default:
                    safe[j++] = brocabulary[i];
                    break;
            }
        }
        safe[j-1] = '\'';

        strcpy(cmd, "(echo ");
        snprintf(cmd+strlen(cmd), sizeof(cmd)-strlen(cmd), safe);
        strncat(cmd, "| /usr/local/bin/gsed -r -e 's/[bgpt]r[ola]/bro/p')", sizeof(cmd)-strlen(cmd));

        fp = popen(cmd, "r");
        if (fp) {
            memset(buf, 0x00, sizeof(buf));
            fgets(buf, sizeof(buf), fp);
            pclose(fp);

            send(socket, buf, strlen(buf), 0);
        }

        free(safe);
    }

    close(socket);
    return 0;
}
