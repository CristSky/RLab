/**
 * Created by Cristiano on 27/05/2016.
 * cristiano@live.jp
 */
const jwt = require('jsonwebtoken'),
    get_secret = require('./get_secret');

module.exports = (data, ua, callback) => {
    const secret = get_secret(),
        ua_s = get_secret(ua);

    const user = {
        n: data.nome,
        u: data.username,
        id: data.id
    };

    jwt.sign(user, secret + ua_s, {expiresIn: '12h'}, (err, token) => {
        if (err) return callback(err, null);
        else return callback(null, token, ua_s);
    });
};