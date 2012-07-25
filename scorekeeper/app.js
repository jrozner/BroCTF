var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , util = require('util')
  , fs = require('fs')
  , pg = require('pg')
  , db = require('./db/config')
  , User = require('./lib/user')
  , scoreboard = require('./lib/scoreboard')
  , challenge = require('./lib/challenge');

app.listen(8080);
io.set('log level', 0);

function handler(req, res) {
  fs.readFile(__dirname+'/public'+req.url,
  function (err, data) {
    if (err) {
      res.writeHead(500);
    }

    res.writeHead(200);
    res.end(data);
  });
}

var conString = 'tcp://'+db.username+':'+db.password+'@'+db.hostname+':'+db.port+'/'+db.database;
client = new pg.Client(conString);
client.connect();

io.sockets.on('connection', function(socket) {
  var user = new User();

  user.on('score', function(msg) {
    socket.emit('score', {'score': msg.score});
    io.sockets.emit('update_score', msg);
  });

  user.on('error', function(msg) {
    /* Should probably do some sort of logging here. It should only happen if there's a problem
     * on the server side.
     */
  });

  challenge.emitter.on('play_sound', function(msg) {
    io.sockets.emit('play_sound', msg);
  });

  socket.set('user', user, function() {
    socket.emit('ready')
  });

  socket.on('login', function(data) {
    socket.get('user', function(err, user) {
      if (err)
        return socket.emit('error', {'msg': "The was an error retrieving your user object. Let us know."});

      user.login(data.username, data.password, client, function(evt, msg) {
        socket.emit(evt, msg);
      });
    });
  });

  socket.on('send_scoreboard', function(data) {
    socket.get('user', function(err, user) {
      if (err)
        return socket.emit('error', {'msg': "The was an error retrieving your user object. Let us know."});

      if (!user.isLoggedIn())
        return socket.emit('error', {'msg': "You must be logged in to do that."});

      scoreboard.getScores(client, function(evt, msg) {
        socket.emit(evt, msg);
      });
    });
  });

  socket.on('send_challenges', function(data) {
    socket.get('user', function(err, user) {
      if (err)
        return socket.emit('error', {'msg': "The was an error retrieving your user object. Let us know."});

      if (!user.isLoggedIn())
        return socket.emit('error', {'msg': "You must be logged in to do that."});

      challenge.sendOpenChallengesForUser(user.id, client, function(evt, msg) {
        socket.emit(evt, msg);
      });
    });
  });

  socket.on('submit_flag', function(data) {
    socket.get('user', function(err, user) {
      if (err)
        return socket.emit('error', {'msg': "The was an error retrieving your user object. Let us know."});

      user.submitFlag(data.challengeId, data.flag, client, function(evt, msg) {
        socket.emit(evt, msg);
      });
    });
  });
});
