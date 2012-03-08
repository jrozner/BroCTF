//var io = require('socket.io').listen(8080);
var pg = require('pg');

client = new pg.Client({user: 'scorekeeper', password: 'scorekeeper', database: 'scorekeeper'});
client.connect();

function login(username, password) {
  var query = client.query("select * from users where username = $1 and password = $2 limit 1", [username, password], function(data) {
    return data;
  });
}

console.log(login('joe','rozner'));
/*
io.sockets.on('connection', function(socket) {

  socket.on('login', function(data) {
    if (playerLogin(data.username, data.password) == true) {
      
      socket.emit('login_success');
    } else {
      socket.emit('login_failure');
    }
  });

  socket.on('getBoardData', function() {
    var visibleBoard = getVisibleBoard(username);
  });
});

function playerLogin(username, password) {
  if (username == 'joe') {
    return true;
  } else {
    return false;
  }
}
*/
