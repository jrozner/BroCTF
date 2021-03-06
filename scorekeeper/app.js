var static = require('node-static')
  , fileServer = new static.Server('./public')
  , io = require('socket.io')
  , net =  require('net') , pg = require('pg')
  , db = require('./db/config')
  , User = require('./lib/user')
  , scoreboard = require('./lib/scoreboard')
  , challenge = require('./lib/challenge');

var app = require('http').createServer(function (request, response) {
    request.addListener('end', function () {
    fileServer.serve(request, response);
  });
}).listen(8080);
io = io.listen(app);
io.set('log level', 0);

var actions = {
  'user_added': User.addTeam,
  'user_removed': User.removeTeam,
  'give_bonus': function() {},
  'solve_challenge': challenge.solveChallenge
}

var conString = 'tcp://'+db.username+':'+db.password+'@'+db.hostname+':'+db.port+'/'+db.database;
client = new pg.Client(conString);
client.connect();

/*
var server = netCreateServer(function(socket) {
  socket.on('data', function(data) {
    if ((data.action === undefined) || (data.action === ''))
      return socket.write({'result': "error", 'msg': "No action specified."});

    if ((actions[data.action] === undefined) || (typeof actions[data.action] !== 'function'))
      return socket.write({'result': "error", 'msg': "Action is not valid."});

    actions[data.action](client, data, function(evt, msg) {
      return io.sockets.emit(evt, msg);
    });
  });
});

User.on('user_added', function(msg) {
  io.sockets.emit('add_user', msg);
}

User.on('user_removed', function(msg) {
  io.sockets.emit('remove_user', msg);
}
*/

challenge.emitter.on('play_sound', function(msg) {
  io.sockets.emit('play_sound', msg);
});

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

  challenge.emitter.on('tier_complete', function() {
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
