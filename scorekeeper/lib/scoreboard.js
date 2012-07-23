exports.getScores = function(client, cb) {
  var sql = 'select u.id, u.username, coalesce(sum(c.value), 0) as score from user_flags uf left join users u on u.id = uf.user_id left join challenges c on c.id = uf.challenge_id where u.id > 0 group by (u.id) order by score desc';
  client.query(sql, function(err, result) {
    if (err)
      return cb('error', {'msg': err});

    return cb('scoreboard', result.rows);
  });
}

exports.getScoreByUserId = function(client, userId, cb) {
  if (userId === undefined)
    return false;

  var sql = 'select coalesce(sum(c.value), 0) as score from challenges c inner join user_flags uf on uf.challenge_id = c.id where uf.user_id = $1';
  client.query(sql, [userId], function(err, result) {
    if (err)
      return cb('error', {'msg': err});

    if (result.rows.length < 1)
      return cb('error', {'msg': 'Could not find any flags that you have captured. Something is wrong here.'});

    return cb('score', {'userId': userId, 'score': result.rows[0].score});
  });
}
