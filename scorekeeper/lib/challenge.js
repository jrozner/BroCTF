exports.sendChallenges = function() {
  // do logic to bail early
  // get open challenges
  // send back open challenges
}

exports.verifyFlag = function(challengeId, flag, client, cb) {
  var sql = 'select id from challenges where id = $1 and flag = $2';
  client.query(sql, [challengeId, flag], function(err, result) {
    if (err)
      return cb(false, 'error', {'msg': "There was a problem with the database. Perhaps you're trying something you shouldn't be?"});

    if (result.rows.length > 0) {
      cb(true, 'flag_accepted', {'challengeId': challengeId});
    } else {
      cb(false, 'invalid_flag');
    }
  });
}
