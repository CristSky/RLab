"use strict";
/**
 * Created by Cristiano on 30/10/2016.
 * https://github.com/CristSky/
 * VLab
 */
const express = require('express'),
    router = express.Router(),
    models = require('./../models'),
    request = require('request'),
    serial_uart = require('./../lib/serial_uart'),
    view = 'lab_area',

    CMDSW = String.fromCharCode(0x80),
    SENDDIN = String.fromCharCode(0x90),
    RST = String.fromCharCode(0xa0),
    CMDDATA = {l: [], d: []};


router
    .get('/:id', (req, res) => {
        const id = req.params.id;

        if (id) {
            serial_uart.writer(RST, 1);
            serial_uart.set_busy(id, true);

            models.Device
                .findByPrimary(id)
                .then((device) => {
                    if (device) {

                        res.render(view, {
                            title: 'R-Lab - Sobre',
                            user_name: req.user_name,
                            ref: view,
                            camera: '/lab_area/camera/' + device.id,
                            device: device.id
                        });
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
        } else
            res.redirect('/upload');
    })

    .get('/camera/:id', (req, res) => {
        models.Device
            .findByPrimary(req.params.id)
            .then((device) => {
                if (device) {
                    const r = request(device.camera_ip);
                    req.pipe(r);

                    r
                        .on('data', () => {
                            res.on('close', () => {
                                r.abort();
                            });
                        })
                        .on('error', () => {
                            res.sendFile('sem_camera.jpg', {root: './public/images/'});
                        })
                        .pipe(res);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    })

    .post('/:cmd/:id', (req, res) => {
        const id = req.params.id,
            cmd = req.params.cmd,
            data = req.body.rx,

            send_data = [];


        switch (cmd) {
            case 'sw':
                send_data.push(CMDSW);
                send_data.push(CMDDATA[req.body.tipo][req.body.swi]);
                break;

            case 'rst':
                send_data.push(RST);
                break;

            case 'rx':
                send_data.push(SENDDIN);
                send_data.push(new Buffer(data, 'binary'));
                break;
        }

        serial_uart.writer(send_data, id);


        res.status(200).send();
    })

    .get('/txdata/:id', (req, res) => {
        const id = req.params.id;
        serial_uart.set_busy(id, true);
        res.send(serial_uart.read_tx_buffer());
    });


for (let i = 0; i <= 15; i++) {
    CMDDATA.l[i] = new Buffer(String.fromCharCode(0x00 + i), 'binary');
    CMDDATA.d[i] = new Buffer(String.fromCharCode(0xc0 + i), 'binary');
}


module.exports = router;