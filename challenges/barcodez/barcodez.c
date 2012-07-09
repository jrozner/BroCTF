#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/stat.h>
#include "libjack3d.h"

#define USER "barcodez"
#define PORT 7469
#define SIZE 1337
#define IMG_ROOT "/tmp/images/"

int barcodez(int);

int main(int argc, char **argv) {
  int socket;

  daemonize(USER);

  if ((socket = initListener(NULL, PORT)) == -1)
    exit(1);

  return startService(&barcodez, socket);
}

int barcodez(int socket) {
  char tehfile[60];
  char safe[] = IMG_ROOT;
  char path[sizeof(safe)+40];
  char cobracmdr[sizeof(path)+9];
  char data[600];
  char safepath[sizeof(path)];
  int res = 0;
  FILE *fp;

  memset(tehfile, 0x0, sizeof(tehfile));
  memset(path, 0x0, sizeof(path));
  memset(cobracmdr, 0x0, sizeof(cobracmdr));
  memset(data, 0x0, sizeof(data));
  memset(safepath, 0x0, sizeof(safepath));

  sendString(socket, "Welcome to the data matrix bar code reader.\n");
  sendString(socket, "Enter the name of file uploaded to decode data.\n> ");

  if ((res = recvUntil(socket, tehfile, sizeof(tehfile) - 1, '\n')) == 0) {
    fprintf(stderr, "No datas!\n");
    close(socket);
    exit(1);
  }

  snprintf(path, sizeof(path), "%s%s", safe, tehfile);

  if ((res = validPath(safe, path)) == -1) {
    sendString(socket, "Hey! You can't look in there.\n");
    fprintf(stderr, "%s is not a valid file path.\n", path);
    close(socket);
    exit(1);
  }

  // Make sure we have a copy of the path that can't get overwritten so we can
  // remove the file after reading it in.
  strncpy(path, safepath, sizeof(safepath));
  snprintf(cobracmdr, sizeof(cobracmdr), "dmtxread %s", path);

  if ((fp = popen(cobracmdr, "r")) == NULL) {
    perror("popen");
    close(socket);
    exit(1);
  }

  fread(data, SIZE, 1, fp);
  fclose(fp);
  unlink(safepath);

  if (data[0] == 0x0) {
    sendString(socket, "Looks like you lost your file!\n");
    fprintf(stderr, "Nothing read!\n");
    close(socket);
    exit(1);
  }

  sendString(socket, data);

  close(socket);
  return 0;
}
