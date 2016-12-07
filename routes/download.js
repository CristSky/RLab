"use strict";
const express = require('express'),
    router = express.Router(),
    models = require('./../models'),
    view = 'download';


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

                    res.render(view, {
                        title: 'R-Lab - Download',
                        user_name: req.user_name,
                        ref: view,
                        projetos: projetos
                    });
                } else {
                    res.render(view, {
                        title: 'R-Lab - Download',
                        user_name: req.user_name,
                        ref: view,
                        projetos: projetos
                    });
                }
            })
            .catch((err) => {
                console.error(err);
                res.render(view, {title: 'R-Lab', user_name: req.user_name, ref: view});
            });

    })
    .get('/uart_file', (req, res) => {
        const filename = 'VHDL_UART_RLAB.zip',
            options = {
                root: './public/',
                dotfiles: 'deny',
                headers: {
                    'Content-disposition': 'inline; filename="' + filename + '"',
                    'Content-type': 'application/zip',
                    'x-timestamp': Date.now(),
                    'x-sent': true
                }
            };
        res.sendFile(filename, options);
    });

module.exports = router;