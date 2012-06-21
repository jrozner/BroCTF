#include <stdlib.h>
#include <unistd.h>
#include "libjack3d.h"

#define USER "joe"
#define PORT 54321

int vulnerable(int socket);

int main(int argc, char **argv) {
  daemonize(USER);
  int socket;

  if ((socket = initListener(NULL, PORT)) == -1)
    exit(1);
  return startService(&vulnerable, socket);
}

int vulnerable(int socket) {
  sendString(socket, "Test!");
  close(socket);
  return 0;
}
