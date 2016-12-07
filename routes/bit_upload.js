"use strict";
const express = require('express'),
    router = express.Router(),
    multer = require('multer'),
    fs = require('fs-extra'),
    models = require('./../models'),
    exec = require('child_process').execFile,
    uart = require('./../lib/serial_uart'),
    view = 'bit_upload';


router
    .get('/', (req, res) => {
        models
            .Device
            .findAll()
            .then((devices) => {
                if (devices) {
                    let d = [];

                    for (let el of devices) {
                        d.push({
                            id: el.id,
                            dispositivo: el.dispositivo,
                            busy: uart.is_busy(el.id)
                        });
                    }

                    res.render(view, {
                        title: 'R-Lab - Erro',
                        user_name: req.user_name,
                        ref: view,
                        msg: (d.length == 0),
                        devices: d
                    });
                } else {
                    res.render(view, {title: 'R-Lab - Erro', user_name: req.user_name, ref: view, msg: true});
                }
            })
            .catch((err) => {
                console.error(err);
                res.render(view, {title: 'R-Lab - Erro', user_name: req.user_name, ref: view, msg: true});
            });

    })

    .post('/', (req, res) => {

        multer({dest: './bit_upload/' + req.user_id + '/'}).single('bit_file')(req, res, () => {
            let target = './bit_upload/' + req.user_id + '/' + req.file.filename,
                device = parseInt(req.body.device),
                file = req.file;

            if (!uart.is_busy(device)) {

                uart.set_busy(device, true);

                try {
                    // arquivo de comando batch do impact criado dinamicamente
                    let cmd = 'setmode -bscan\n' +
                        'setCable -p auto\n' +
                        'identify\n' +
                        'assignfile -p ' + device + ' -file ./run_impact/main' + device + '.bit\n' +
                        'program -p ' + device + '\n' +
                        'quit';

                    fs.writeFile('./run_impact/set' + device + '.cmd', cmd, (err) => {
                        if (err) {
                            console.error('Oh no, there was an error: ' + err);
                            res.render(view, {title: 'R-Lab - Sobre', user_name: req.user_name, ref: view, debug: err});
                        } else {
                            console.log('cmd set device criado');

                            fs.copy(target, './run_impact/main' + device + '.bit', {replace: true}, (err) => {
                                if (err) {
                                    console.error(err);
                                    res.render(view, {
                                        title: 'R-Lab - Sobre',
                                        user_name: req.user_name,
                                        ref: view,
                                        debug: err
                                    });
                                } else {

                                    exec('impact', ['-batch ./run_impact/set' + device + '.cmd'], (error, stdout) => {
                                        if (error) {
                                            console.error('Oh no, there was an error: ' + error.message);
                                            res.render(view, {
                                                title: 'R-Lab - Sobre',
                                                user_name: req.user_name,
                                                ref: view,
                                                debug: error.message
                                            });
                                        } else {
                                            persist_bitfile(file, req.user_id, req.body.desc);

                                            console.log(stdout);
                                            res.redirect('/lab_area/' + device);
                                        }
                                    });
                                }
                            });
                        }
                    });
                } catch (err) {
                    console.error('Oh no, there was an error: ' + err);
                    res.render(view, {title: 'R-Lab - Sobre', user_name: req.user_name, ref: view, debug: err});
                }
            } else res.redirect('/upload');
        });
    });


/**
 * guarda dados do arquivo bit enviado no db
 * @param file_obj object
 * @param uid string|number
 * @param desc string
 */
function persist_bitfile(file_obj, uid, desc) {
    if (file_obj && uid) {
        models.BitFile
            .create({
                filename: file_obj.filename,
                destination: file_obj.destination,
                originalname: file_obj.originalname,
                desc: desc || null,
                UserId: uid
            })
            .then((file) => {
                if (file) console.log(file.toJSON());
            })
            .catch((err) => {
                console.error(err);
            });
    }
}


module.exports = router;