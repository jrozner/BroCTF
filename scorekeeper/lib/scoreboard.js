exports.getBoard = function(client, cb) {
}

exports.getScoreByTeam = function(client, teamId, cb) {
  if (teamId === undefined)
    return false;

  var sql = 'select sum(c.value) as score from challenges c inner join user_flags uf on uf.challenge_id = c.id where uf.user_id = $1';
  client.query(sql, [teamId], function(err, result) {
    if (err)
      return cb('error', {'msg': err});

    if (result.rows.length < 1)
      return cb('error', {'msg': 'Could not find any flags that you have captured. Something is wrong here.'});

    return cb('scored', {'teamId': teamId, 'score': result.rows[0].score});
  });
}
