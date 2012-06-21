#ifndef LIBJACK3D_H_
#define LIBJACK3D_H_

int daemonize(char *);
int initListener(char *, unsigned short);
int startService(int (*)(int), int);
void childSigHandler(int);
ssize_t sendMsg(int, char *, size_t);
ssize_t sendString(int, char *);
ssize_t recvUntil(int, char *, size_t);
int getUIdByName(char *);
int dropPrivs(char *);

#endif
