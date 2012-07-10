#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <limits.h>
#include <pwd.h>
#include <unistd.h>
#include <time.h>
#include <openssl/sha.h>
#include "insecurid.h"

#define SIZE 20

int main(int argc, char **argv) {
  unsigned char in[SIZE+sizeof(int)], out[SIZE];
  time_t currentTime = 0, fixedTime = 0;
  int num, res, i, mask;

  memset(in, 0x0, sizeof(in));

  if ((res = readToken(in)) == -1) {
    fprintf(stderr, "Unable to read token.\n");
    exit(1);
  }

  /* Make sure that we generate a token that is valid for 1 minute. To do this
   * we determine the number of seconds in 1 minute (60) then mod this by the
   * current unix time in order to get deviation (in seconds) from the current
   * minute. This is then subtracted from the current unix time in order to
   * get the current minute mark.
   */
  currentTime = time(0);
  fixedTime = currentTime - (currentTime % 60);

  /* Seed the random number generator with the fixed time. */
  srand(fixedTime);
  num = rand();

  /* Crazy hackery in order to get each byte from the random number into the
   * character array since we're not using strings. Append the random number
   * to the shared secret then rehash it to come up with the user's second
   * factor.
   */
  mask = 0xff;
  for (i = 0; i < sizeof(int); i++) {
    mask = mask << (i * 2);
    in[SIZE+i] = (unsigned char)((num & mask) >> (i * 2));
  }

  SHA1(in, sizeof(in), out);

  printf("Welcome to the InsecurID token generator:\nYour token is: ");

  for (i = 0; i < SIZE; i++)
    printf("%x", out[i]);

  printf("\n");

  return 0;
}

int readToken(unsigned char *token) {
  FILE *fp;
  char *path;

  if ((path = getHomeDir()) == NULL) {
    fprintf(stderr, "Could not determine home directory.\n");
    return -1;
  }

  strncat(path, "/.insecurid_token", PATH_MAX);

  if ((fp = fopen(path, "r")) == NULL) {
    fprintf(stderr, "Could not open token file.\n");
    return -1;
  }

  fread(token, SIZE, 1, fp);

  fclose(fp);

  return 0;
}

char *getHomeDir() {
  uid_t uid;
  struct passwd *userInfo;
  char *home;

  uid = geteuid();

  if ((userInfo = getpwuid(uid)) == NULL) {
    perror("getpwuid");
    return NULL;
  }

  if ((home = malloc(PATH_MAX)) == NULL) {
    perror("malloc");
    return NULL;
  }

  strncpy(home, userInfo->pw_dir, PATH_MAX);

  return home;
}
