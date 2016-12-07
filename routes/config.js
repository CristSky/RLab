/**
 * Created by Cristiano on 04/11/2016.
 * https://github.com/CristSky/
 * RLab
 */
"use strict";
const express = require('express'),
    router = express.Router(),
    path = require('path'),
    models = require('./../models'),
    device_idendity = require('./../lib/device_identify'),
    serial_uart = require('./../lib/serial_uart'),
    view = 'config';


router
    .get('/', (req, res) => {
        res.render(view, {title: 'R-Lab', user_name: req.user_name, ref: view});
    })

    .post('/', (req, res) => {
        const fpga = typeof req.body.fpga === 'string' ? [req.body.fpga] : req.body.fpga || [],
            port = typeof req.body.port === 'string' ? [req.body.port] : req.body.port || [],
            camera_ip = typeof req.body.camera_url === 'string' ? [req.body.camera_url] : req.body.camera_url || [],
            config = [];

        try {
            for (let i = 0; i < fpga.length; i++) {
                if (fpga[i].length && port[i].length) {
                    config.push({
                        id: i + 1,
                        dispositivo: fpga[i],
                        porta: port[i],
                        camera_ip: camera_ip[i]
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }

        models.Device.destroy({truncate: true});
        models.Device.bulkCreate(config);

        serial_uart.setup_uart(() => {
            console.log('uart_serial configurado.');
        });

        res.redirect('/');
    })

    .get('/dispositivos', (req, res) => {

        device_idendity.identify((err1, device_list) => {
            device_idendity.list_uart_port((err2, uart_port) => {

                res.json({fpga: err1 || device_list, uart: err2 || uart_port});
            });
        });
    });


module.exports = router;