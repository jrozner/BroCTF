var events = require('events')
  , _ = require('./_util')
  , challenge = require('./challenge');

function User() {
  this.id = undefined;
}

User.prototype = new events.EventEmitter;

User.prototype.login = function(username, password, client, cb) {
  var self = this;

  var sql = 'select id, username from users where username = $1 and password = $2 limit 1';
  client.query(sql, [username, _.sha1(password)], function(err, result) {
    if (err)
      return cb('error', {'msg': "There was a problem with the database. Perhaps you're trying something you shouldn't be?"});

    if (result.rows.length > 0) {
      self.id = result.rows[0].id;
      cb('logged_in');
    } else {
      cb('invalid_login', {'msg': "Invalid username or password."});
    }
  });
}

User.prototype.submitFlag = function(challengeId, flag, client, cb) {
  var self = this;

  if (!this.isLoggedIn())
    return cb('error', {'msg': "You are not logged in."});

  challenge.verifyFlag(challengeId, flag, client, function(isValid, evt, msg) {
    if (isValid === false)
      return cb(evt, msg);

    self._captureFlag(client, msg.challengeId, function() {
      scoreboard.getScoreByTeam(client, self.id, self.emit)
      return cb(evt, msg);
    });
  });
}

User.prototype.isLoggedIn = function() {
  if (this.id === undefined)
    return false;

  return true;
}

User.prototype._captureFlag = function(client, challengeId, cb) {
  var sql = 'insert into user_flags (user_id, challenge_id) values ($1, $2)';

  client.query(sql, [this.id, challengeId], cb);
}

module.exports = User;
