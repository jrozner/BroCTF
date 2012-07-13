var crypto = require('crypto');

exports.sha1 = function(data) {
  if (data === undefined)
    return false;

  return crypto.createHash('sha1').update(data).digest('hex');
}
