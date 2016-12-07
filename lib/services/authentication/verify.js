/**
 * Created by Cristiano on 27/05/2016.
 * cristiano@live.jp
 */
"use strict";
const get_secret = require('./get_secret'),
    jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const secret = get_secret(),
        ua_s = get_secret(req.headers['user-agent']),
        token = req.cookies.rlab || null;

    if (token) {
        jwt.verify(token, secret + ua_s, (err, payload) => {
            if (payload) {
                req.user_id = payload.id;
                req.user_name = payload.n;
                req.user_uname = payload.u;
                if (req.url === '/login' && req.method != 'DELETE') return res.redirect('/');
                else return next();
            }
            else if (req.url.indexOf('/login') === 0)
                return next();
            else
                return res.redirect('/login');
        })

    } else if (req.url.indexOf('/login') === 0)
        return next();
    else
        return res.redirect('/login');
};