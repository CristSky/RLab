/**
 * Created by Cristiano on 04/11/2016.
 * https://github.com/CristSky/
 * RLab
 */
"use strict";
const SerialPort = require('serialport'),
    models = require('./../models');


let instancias = {},
    tx_buffer = [],
    arr = [], interval = null;


function setup_uart(done) {

    instancias = {}; // realoca objeto de instancias desalocando os anteriores.
    tx_buffer = [];

    models
        .Device
        .findAll()
        .then((devices) => {
            if (devices) {

                for (let d of devices) {
                    let device = d.toJSON();

                    set_instancia(device.id, device.porta);
                }

                return done();
            }
        })
        .catch((err) => {
            console.error(err);
        });
}


function set_instancia(id, porta) {

    instancias[id] = new SerialPort(porta, {
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parser: SerialPort.parsers.byteLength(1)
    });

    instancias[id].on('error', (err) => {
        console.error('Error: ', err.message);
    });

    instancias[id].on('data', (data) => {
        tx_buffer.push(data);
    });

    instancias[id].busy = false;
}

/**
 * escreve dados na porta especificada
 * @param data string|object|array
 * @param port_id string|number id do dispositivo
 */
function writer(data, port_id) {
    if (instancias.hasOwnProperty(port_id)) {
        arr = arr.concat(Array.from(data, (el) => {
                if (Buffer.isBuffer(el)) {
                    return el;
                } else if (el) {
                    return el.toString();
                }
            }
        ));

        if (!interval) {
            interval = setInterval(() => {
                if (arr.length) {
                    let vai = arr.shift();
                    console.log('vai', Buffer.from(vai, 'binary'));
                    instancias[port_id].write(Buffer.from(vai, 'binary'));
                } else {
                    clearInterval(interval);
                    interval = null;
                }
            }, 1);
        }
    }
}

/**
 *
 * @param id number|string
 * @param status boolean
 */
    function set_busy(id, status) {
    instancias[id].busy = status;
    instancias[id].time = new Date();
}

function is_busy(id) {
    return instancias[id].busy;
}

function read_tx_buffer() {
    let aux = [];
    aux = aux.concat(tx_buffer);
    tx_buffer = [];

    return aux;
}


setInterval(() => {
    const keys = Object.keys(instancias);

    for (const id of keys) {
        if (instancias[id].busy) {
            const t = new Date();
            if (t - instancias[id].time > 60000) {
                set_busy(id, false);
                console.log(`---> Instância ${id} finalizado.`);
            }
        }
    }
}, 100000);



module.exports = {
    setup_uart: setup_uart,
    writer: writer,
    read_tx_buffer: read_tx_buffer,
    set_busy: set_busy,
    is_busy: is_busy
};
