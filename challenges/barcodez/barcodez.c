#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include "libjack3d.h"

#define USER "barcodez"
#define PORT 7469
#define SIZE 1337

int barcodez(int);

int main(int argc, char **argv) {
  daemonize(USER);
  int socket;

  if ((socket = initListener(NULL, PORT)) == -1)
    exit(1);
  return startService(&barcodez, socket);
}

int barcodez(int socket) {
  char tehfile[60];
  char cobracmdr[250];
  char data[600];
  int res = 0;
  FILE *fp;

  memset(tehfile, 0x0, sizeof(tehfile));
  memset(cobracmdr, 0x0, sizeof(cobracmdr));
  memset(data, 0x0, sizeof(data));
  memset(lolwut, 0x0, sizeof(lolwut));

  sendString(socket, "Welcome to the QR code reader.\n");
  sendString(socket, "Enter the name of file uploaded to decode data.\n> ");

  if ((res = recvUntil(socket, tehfile, sizeof(tehfile) - 1, '\n')) == 0) {
    fprintf(stderr, "No datas!\n");
    close(socket);
    exit(1);
  }

  snprintf(cobracmdr, sizeof(cobracmdr), "./zxing images/%s", tehfile);

  if ((fp = popen(cobracmdr, "r")) == NULL) {
    perror("popen");
    close(socket);
    exit(1);
  }

  fread(data, SIZE, 1, fp);

  if (data[0] == 0x0) {
    fprintf(stderr, "Nothing read!\n");
    close(socket);
    exit(1);
  }

  sendString(socket, data);

  close(socket);
  return 0;
}
