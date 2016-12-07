"use strict";
const express = require('express'),
    router = express.Router(),
    multer = require('multer'),
    models = require('./../models'),
    auth = require('./../lib/services/authentication'),
    view = 'login';


router
    .get('/', (req, res) => {
        res.render(view, {title: 'Login', msg: '', layout: 'login'});
    })

    .delete('/', (req, res) => {
        res.clearCookie('rlab');
        res.send('logout');
    })

    .post('/', multer().array(), (req, res) => {
        models
            .User
            .findOne({
                where: {
                    username: req.body.username
                }
            })
            .then((user) => {
                if (user) {
                    user.isValidPassword(req.body.password, (err, status) => {
                        console.log('login err:', err, 'login status:', status, req.headers['user-agent']);
                        if (status) {
                            auth.sign(user.toJSON(), req.headers['user-agent'], (err, token) => {
                                console.log('login token:', token);
                                if (err)
                                    res.render(view, {title: 'Login', msg: 'Erro não identificado!', layout: 'login'});
                                else
                                    res
                                        .cookie('rlab', token, {maxAge: 36000000, httpOnly: true})
                                        .redirect('/');
                            });

                        } else res.render(view, {
                            title: 'Login',
                            msg: 'Informações de Login Invalidas',
                            layout: 'login'
                        });
                    });
                } else res.render(view, {title: 'Login', msg: 'Informações de Login Invalidas', layout: 'login'});
            });
    })

    .post('/cadastro', multer().array(), (req, res) => {
        const user = req.body;

        console.error(user);

        if (user.nome && user.sobrenome && user.password && user.email && user.username) {
            user.email = user.email.toLowerCase().trim();
            const email_validate = user.email.split('@');

            if (email_validate) {

                models
                    .User
                    .findOrCreate({
                        where: {
                            email: user.email
                        },
                        defaults: user
                    })
                    .spread((user, created) => {
                        if (created) {
                            auth.sign(user.toJSON(), req.headers['user-agent'], (err, token) => {
                                console.log('login token:', token);
                                if (err)
                                    res.render(view, {title: 'Login', msg: 'Erro não identificado!', layout: 'login'});
                                else
                                    res
                                        .cookie('rlab', token, {maxAge: 36000000, httpOnly: true})
                                        .redirect('/');
                            });
                        } else {
                            return res.render(view, {title: 'Login', msg: 'Email já cadastrado!', layout: 'login'});
                        }
                    })
                    .catch((err) => {
                        res.render(view, {title: 'Login', msg: 'Erro interno!', layout: 'login'});
                        return console.error(err);
                    });
            } else {
                res.render(view, {title: 'Login', msg: 'email inválido', layout: 'login'});
            }

        } else {
            res.render(view, {title: 'Login', msg: 'Faltando informações', layout: 'login'});
        }
    });


module.exports = router;