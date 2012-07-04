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
#ifdef __linux__
#include <wait.h>
#endif
#include "libjack3d.h"

/*
 * daemonize turns the process into a daemon and drops privs to the
 * specified user.
 *
 * @param user is the username on the system
 *
 * Returns 0 on success and -1 on error
 */
int daemonize(char *user) {
  int ret = 0;

  if ((ret = dropPrivs(user)) == -1) {
    fprintf(stderr, "Unable to drop privs.\n");
    return -1;
  }

  if ((ret = daemon(1, 0)) == -1) {
    perror("daemon");
    return -1;
  }

  return 0;
}

/*
 * initListener creates a new socket and sets it up to listen on a specified
 * port.
 *
 * @param port is the port to listen on
 *
 * Returns the new socket on success and -1 on error
 */
int initListener(char *addr, unsigned short port) {
  int serverSocket = 0, ret = 0, optTrue = 1;
  struct sockaddr_in listener;

  memset(&listener, 0x0, sizeof(struct sockaddr_in));
  listener.sin_family = AF_INET;
  listener.sin_port = htons(port);

  if (addr != NULL) {
  } else {
    listener.sin_addr.s_addr = INADDR_ANY;
  }

  if ((serverSocket = socket(PF_INET, SOCK_STREAM, 0)) == -1) {
    perror("socket");
    exit(1);
  }

  if ((ret = setsockopt(serverSocket, SOL_SOCKET, SO_REUSEADDR, &optTrue, sizeof(int))) == -1) {
    perror("setsockopt");
    exit(1);
  }

  if ((ret = bind(serverSocket, (struct sockaddr *)&listener, sizeof(listener))) == -1) {
    perror("bind");
    exit(1);
  }

  listen(serverSocket, 10);

  return serverSocket;
}

int startService(int (*ptr)(int socket), int serverSocket) {
  struct sockaddr_in incoming;
  struct sigaction childHandler;
  int newConnection;
  socklen_t addrSize = sizeof(incoming);
  pid_t pid = 0;

  childHandler.sa_handler = childSigHandler;
  sigemptyset(&childHandler.sa_mask);
  childHandler.sa_flags = SA_RESTART;

  if (sigaction(SIGCHLD, &childHandler, NULL) == -1) {
    perror("sigaction");
    return -1;
  }

  while (1) {
    if ((newConnection = accept(serverSocket, (struct sockaddr *) &incoming, &addrSize)) == -1) {
      perror("accept");
      return -1;
    }

    switch(fork()) {
      case 0:
        close(serverSocket);
        return (* ptr)(newConnection);
      case -1:
        perror("fork");
        return -1;
      default:
        close(newConnection);
    }
  }

  close(serverSocket);
}

void childSigHandler(int signal) {
  while (waitpid(-1, NULL, WNOHANG) > 0);
}

/* sendMsg sends an arbitrary chunk of bytes to a socket
 *
 * @param socket is the socket to send to
 * @param msg is the array of bytes to send
 * @param sz is the number of bytes to send
 *
 * Returns the number of bytes sent on success and -1 on error
 */
ssize_t sendMsg(int socket, char *msg, size_t sz) {
  ssize_t sent = 0, ret = 0;

  while (sent < sz) {
    if ((ret = send(socket, msg, sz, 0)) == -1) {
      perror("send");
      return -1;
    }
    sent += ret;
  }

  return sent;
}

/* sendString sends a cstring to a socket
 *
 * @param socket
 * @param string
 *
 * Returns the number of bytes sent on success and -1 on error
 */
ssize_t sendString(int socket, char *string) {
  ssize_t sent = 0, ret = 0;
  size_t sz = 0;

  sz = strlen(string);

  while (sent < sz) {
    if ((ret = send(socket, string, sz, 0)) == -1) {
      perror("send");
      return -1;
    }
    sent += ret;
  }

  return sent;
}

/*
 * recvUntil recieves from socket until end char or sz bytes
 *
 * @param socket socket to read from
 * @param buff buffer to store data in
 * @param sz number of bytes to read
 * @param end char to stop reading on
 *
 * Make sure that sz is size - 1 of the buffer it writes to to ensure that the
 * null byte does not write past the end of the buffer.
 */
ssize_t recvUntil(int socket, char *buff, size_t sz, char end) {
  ssize_t read = 0, ret = 0;

  while (read < sz) {
    ret = recv(socket, buff + read, sz - read, 0);

    if (ret == -1) {
      perror("recv");
      return -1;
    }

    read += ret;

    // Client has stopped sending
    if ((ret == 0) || (buff[read - 1] == end))
      break;
  }

  buff[read - 1] = '\0';

  return read;
}

/*
 * getUIdByName returns the UID of a user
 *
 * @param userName
 *
 * Returns the UID of the user on success or -1 on error
 */
int getUIdByName(char *userName) {
  struct passwd *userInfo;

  if ((userInfo = getpwnam(userName)) == NULL) {
    perror("getpwnam");
    return -1;
  }

  return userInfo->pw_uid;
}

/*
 * dropPrivs sets all privileges to that of the specified user
 *
 * @param userName
 *
 * Returns 0 on success and -1 on error
 */
int dropPrivs(char *userName) {
  struct passwd *id;
  int ngroups = 0, *groupList;
  ngroups = sysconf(_SC_NGROUPS_MAX);

  if (getUIdByName(userName) == getuid()) // check if we need to change user
    return 0;

  if ((groupList = malloc(sizeof(gid_t) * ngroups)) == NULL) {
    perror("malloc");
    return -1;
  }

  memset(groupList, 0x0, sizeof(gid_t) * ngroups);

  if ((id = getpwnam(userName)) == NULL) {
    perror("getpwnam");
    return -1;
  }

  getgrouplist(userName, id->pw_gid, groupList, &ngroups);

  if (setgroups(ngroups, (gid_t *) groupList) == -1) {
    perror("setgroups");
    return -1;
  }

  free(groupList);

  if (setgid(id->pw_gid) == -1) {
    perror("setgid");
    return -1;
  }

  if (setuid(id->pw_uid) == -1) {
    perror("setuid");
    return -1;
  }

  return 0;
}
