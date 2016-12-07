"use strict";
const express = require('express'),
    router = express.Router(),
    path = require('path'),
    models = require('./../models'),
    view = 'index';


router
    .get('/', (req, res) => {
        models
            .User
            .findByPrimary(req.user_id, {
                attributes: ['id', 'username', 'nome', 'sobrenome'],
                include: [models.BitFile]
            })
            .then((user) => {
                if (user) {
                    const projetos = [];

                    for (const proj  of user.BitFiles) {
                        const p = proj.toJSON();
                        p.createdAt = new Date(p.createdAt).toLocaleString();
                        projetos.push(p);
                    }

                    res.render(view, {title: 'R-Lab', user_name: req.user_name, ref: view, projetos: projetos});
                } else {
                    res.render(view, {title: 'R-Lab', user_name: req.user_name, ref: view, projetos: []});
                }
            })
            .catch((err) => {
                console.error(err);
                res.render(view, {title: 'R-Lab', user_name: req.user_name, ref: view});
            });
    });


module.exports = router;