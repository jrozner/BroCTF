var events = require('events')
  , _ = require('./_util')
  , challenge = require('./challenge')
  , scoreboard = require('./scoreboard');

function User() {
  this.id = undefined;
}

User.prototype = new events.EventEmitter;

User.prototype.login = function(username, password, client, cb) {
  var self = this;

  var sql = 'select u.id, u.username, coalesce(sum(c.value),0) as score from users u left join user_flags uf on u.id = uf.user_id left join challenges c on uf.challenge_id = c.id where username = $1 and password = $2 group by u.id limit 1';
  client.query(sql, [username, _.sha1(password)], function(err, result) {
    if (err)
      return cb('error', {'msg': "There was a problem with the database. Perhaps you're trying something you shouldn't be?"});

    if (result.rows.length > 0) {
      self.id = result.rows[0].id;
      return cb('logged_in', {'userId': result.rows[0].id, 'username': result.rows[0].username, 'score': result.rows[0].score});
    } else {
      return cb('error', {'msg': "Invalid username or password."});
    }
  });
}

User.prototype.submitFlag = function(challengeId, flag, client, cb) {
  var self = this;

  if (!this.isLoggedIn())
    return cb('error', {'msg': "You are not logged in."});

  if ((challengeId === undefined) || (challengeId === '') || (flag === undefined) || (flag === ''))
    return cb('error', {'msg': 'You must submit a flag and challenge id.'});

  challenge.verifyFlag(client, challengeId, flag, function(isValid) {
    if (isValid === false)
      return cb('error', {'msg': "Flag is not valid."});

    self._checkSubmitted(client, challengeId, function(isSubmitted) {
      if (isSubmitted === true)
        return cb('error', {'msg': 'That flag has already been submitted.'});

      challenge._checkTierComplete(client, cb);
      self._captureFlag(client, challengeId, function(isCaptured) {
        if (isCaptured === false)
          return cb('error', {'msg': 'Unable to capture flag.'});

        scoreboard.getScoreByUserId(client, self.id, function(evt, msg) {
          self.emit(evt, msg);
        });
        challenge._checkFirstBlood(client, challengeId, cb);
        return cb('flag_accepted', {'challengeId': challengeId});
      });
    });
  });
}

User.prototype.isLoggedIn = function() {
  if (this.id === undefined)
    return false;

  return true;
}

User.prototype._checkSubmitted = function(client, challengeId, cb) {
  var sql = 'select id from user_flags where user_id = $1 and challenge_id = $2';

  client.query(sql, [this.id, challengeId], function(err, result) {
    if (err)
      return cb(false);

    if (result.rows.length > 0)
      return cb(true);

    return cb(false);
  });
}

User.prototype._captureFlag = function(client, challengeId, cb) {
  var sql = 'insert into user_flags (user_id, challenge_id) values ($1, $2)';

  client.query(sql, [this.id, challengeId], function(err) {
    if (err)
      return cb(false);

    return cb(true);
  });
}

User.prototype.createUser = function(client, data, cb) {
  var self = this;
  var sql = 'insert into users (username, password) values($1, $2) returning id';
  client.query(sql, [data.username, data.password], function(err, result) {
    if (err)
      return cb({'msg': "Could not add user."});

    self.emit('team_added', result.row[0].id);
    return cb({'msg': "User added"});
  });
}

User.prototype.removeUser = function(client, data, cb) {
  var self = this;
  var sql = 'delete from users where username = $1 returning id';
  client.query(sql, [data.username], function(err, result) {
    if (err)
      return cb({'msg': "Could not remove user."});

    self.emit('team_removed', result.rows[0].id)
    return cb({'msg': "User removed"});
  });
}

module.exports = User;
