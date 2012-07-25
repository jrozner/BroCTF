var events = require('events');
exports.emitter = new events.EventEmitter();

exports.sendOpenChallengesForUser = function(userId, client, cb) {
  exports._currentTier(client, function(tier) {
    exports._getChallengesByTier(userId, tier, client, cb);
  });
}

exports.verifyFlag = function(client, challengeId, flag, cb) {
  var sql = 'select id from challenges where id = $1 and flag = $2';
  client.query(sql, [challengeId, flag], function(err, result) {
    if (err)
      return cb(false, 'error', {'msg': "There was a problem with the database. Perhaps you're trying something you shouldn't be?"});

    if (result.rows.length > 0) {
      cb(true);
    } else {
      cb(false);
    }
  });
}

exports._currentTier = function(client, cb) {
  var tier = 1;
  var sql = 'select distinct challenge_id from user_flags';
  client.query(sql, [], function(err, result) {
    if (err)
      return;

    var rows = result.rows.length;
    if (rows >= 0 && rows < 5)
      tier = 1;
    else if (rows >= 5 && rows < 9)
      tier = 2;
    else if (rows >= 9 && rows < 12)
      tier = 3;
    else if (rows >= 12 && rows < 14)
      tier = 4;
    else
      tier = 5;

    return cb(tier);
  });
}

exports._getChallengesByTier = function(userId, tier, client, cb) {
  var sql = 'select c.id, c.description, c.value, (select id is not null from user_flags where challenge_id = c.id and user_id = $1) as solved from challenges c left join user_flags uf on uf.challenge_id = c.id where tier <= $2 group by c.id order by c.id desc;'
  client.query(sql, [userId, tier], function(err, result) {
    if (err)
      return;

    cb('challenges', result.rows);
  });
}

exports._checkFirstBlood = function(client, challengeId, cb) {
  var self = this;
  var sql = 'select count(id) as captures from user_flags where challenge_id = $1';
  client.query(sql, [challengeId], function(err, result) {
    if (err)
      return;

    if (result.rows[0].captures === 1)
      self.emitter.emit('play_sound', {'name':"firstblood"});
  });
}
