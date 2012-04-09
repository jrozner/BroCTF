#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <pwd.h>
#include <sys/socket.h>
#include <sys/param.h>
#include <sys/types.h>
#include <netinet/in.h>
#include <signal.h>
#include <arpa/inet.h>

int daemonize(char *);
int initListener(char *, unsigned short);
int startService(int (*)(int), int);
void childSigHandler(int);
ssize_t sendMsg(int, char *, size_t);
ssize_t sendString(int, char *);
ssize_t recvUntil(int, char *, size_t);
int getUIdByName(char *);
int dropPrivs(char *);
