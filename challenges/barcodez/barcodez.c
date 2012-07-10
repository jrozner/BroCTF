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

/* OH NOEZ! A global var. GCC kept placing the location this pointed to onto
   the stack in a place that was getting overwritten. I thought it was going
   to make the challenge a little more difficult than it needed to be so this
   is a temporary fix until I can figure out a proper way. YAY Heap!
*/
FILE *fp;

int barcodez(int);

int main(int argc, char **argv) {
  int socket;

  daemonize(USER);

  if ((socket = initListener(NULL, PORT)) == -1)
    exit(1);

  return startService(&barcodez, socket);
}

int barcodez(int socket) {
  char tehfile[41];
  char safe[] = IMG_ROOT;
  char cobracmdr[sizeof(tehfile)+sizeof(safe)+9];
  char data[600];
  char safepath[sizeof(safe)+sizeof(tehfile)];
  int res = 0;

  memset(tehfile, 0x0, sizeof(tehfile));
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

  snprintf(safepath, sizeof(safepath), "%s%s", safe, tehfile);

  if ((res = validPath(safe, safepath)) == -1) {
    sendString(socket, "Hey! You can't look in there.\n");
    fprintf(stderr, "%s is outside the safe path.\n", safepath);
    close(socket);
    exit(1);
  }

  snprintf(cobracmdr, sizeof(cobracmdr), "dmtxread %s", safepath);

  if ((fp = popen(cobracmdr, "r")) == NULL) {
    perror("popen");
    close(socket);
    exit(1);
  }

  fread(data, SIZE, 1, fp);

  if (data[0] == 0x0) {
    sendString(socket, "Looks like you lost your file!\n");
    fprintf(stderr, "Nothing read!\n");
    close(socket);
    exit(1);
  }

  sendString(socket, data);

  fclose(fp);
  unlink(safepath);
  close(socket);
  return 0;
}
