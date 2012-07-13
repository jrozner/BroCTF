var io = require('socket.io').listen(8080)
  , pg = require('pg')
  , db = require('./db/config')
  , User = require('./lib/user')
  , scoreboard = require('./lib/scoreboard')
  , challenge = require('./lib/challenge');

var conString = 'tcp://'+db.username+':'+db.password+'@'+db.hostname+':'+db.port+'/'+db.database;
client = new pg.Client(conString);
client.connect();

client.query('select * from users');

io.set('log level', 0);

io.sockets.on('connection', function(socket) {
  var user = new User();

  user.on('scored', function(msg) {
    socket.broadcast.emit('update_score', msg);
  });

  socket.set('user', user, function() {
    socket.emit('ready')
  });

  socket.on('login', function(data) {
    socket.get('user', function(user) {
      if (typeof user === undefined)
        return socket.emit('error', {'msg': "The was an error retrieving your user object. Let us know."});

      user.login(client, socket.emit);
    });
  });

  socket.on('send_scoreboard', function(data) {
    socket.get('user', function(user) {
      if (typeof user === undefined)
        return socket.emit('error', {'msg': "The was an error retrieving your user object. Let us know."});

      if (!user.isLoggedIn())
        return socket.emit('error', {'msg': "You must be logged in to do that."});

      scoreboard.sendScoreboard(client, socket.emit);
    });
  });

  socket.on('send_challenges', function(data) {
    socket.get('user', function(user) {
      if (typeof user === undefined)
        return socket.emit('error', {'msg': "The was an error retrieving your user object. Let us know."});

      if (!user.isLoggedIn())
        return socket.emit('error', {'msg': "You must be logged in to do that."});

      challenge.sendChallenges(client, socket.emit);
    });
  });

  socket.on('submit_flag', function(data) {
    if ((typeof data.challengeId === undefined) || (typeof data.flag === undefined))
      return socket.emit('error', {'msg': "You must submit a challenge id and flag."});

    socket.get('user', function(user) {
      if (typeof user === undefined)
        return socket.emit('error', {'msg': "The was an error retrieving your user object. Let us know."});

      user.submitFlag(challengeId, flag, client, socket.emit);
    });
  });
});
