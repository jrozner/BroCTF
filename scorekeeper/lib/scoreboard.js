exports.getScores = function(client, cb) {
  var sql = 'select u.id, u.username, coalesce(sum(c.value), 0) as score from users u left join user_flags uf on u.id = uf.user_id left join challenges c on uf.challenge_id = c.id where u.id > 0 group by(u.id) order by score desc';
  client.query(sql, function(err, result) {
    if (err)
      return cb('error', {'msg': err});

    return cb('scoreboard', result.rows);
  });
}

exports.getScoreByUserId = function(client, userId, cb) {
  if (userId === undefined)
    return false;

  var sql = 'select u.id, u.username, coalesce(sum(c.value), 0) as score from challenges c inner join user_flags uf on uf.challenge_id = c.id inner join users u on u.id = uf.user_id where uf.user_id = $1 group by u.id';
  client.query(sql, [userId], function(err, result) {
    if (err)
      return cb('error', {'msg': err});

    if (result.rows.length < 1)
      return cb('error', {'msg': 'Could not find any flags that you have captured. Something is wrong here.'});

    return cb('score', {'userId': result.rows[0].id, 'username': result.rows[0].username, 'score': result.rows[0].score});
  });
}
