#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include "libjack3d.h"

#define USER "joe"
#define PORT 3863
#define SIZE 80
#define CANARY 0x0b120c7f

int netcat(int);
void checkCanary(int, int *);

int main(int argc, char **argv) {
  int socket;

  daemonize(USER);

  if ((socket = initListener(NULL, PORT)) == -1)
    exit(1);

  return startService(&netcat, socket);
}

int netcat(int socket) {
  int canary = CANARY, i;
  char string[SIZE] = "Welcome to NetCat.\nPlease enter 4 lines to concatenate delimeted by a newline:\n";

  sendString(socket, string);

  for (i = 0; i < 4; i++)
    recvUntil(socket, string + (strlen(string) - 1), SIZE, '\n');


  sendMsg(socket, string, SIZE);

  checkCanary(socket, &canary);

  /* Make sure we close the socket before we return that way they can't do a
   * simple dup2()/exec() bind shell. Have fun writing shellcode for this shit.
   */
  close(socket);

  return 0;
}

void checkCanary(int socket, int *canary) {
  if (*canary != CANARY) {
    sendString(socket, "Stack Overflow attempt detected.");
    exit(1);
  }
}
