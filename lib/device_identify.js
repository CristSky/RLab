/**
 * Created by Cristiano on 04/11/2016.
 * https://github.com/CristSky/
 * RLab
 */
"use strict";
var exec = require('child_process').execFile;
var SerialPort = require('serialport');

/**
 * Lista todas as portas UART abertas
 * @param callback function
 */
var list_uart_port = function (callback) {
    let devices = [];

    SerialPort.list(function (err, port_list) {
        if (err) {
            console.error(err);
            return callback(err, devices);
        } else {
            try {
                if (port_list.length) {
                    for (let el of port_list) {
                        devices.push(el);
                    }

                    return callback(null, devices);
                } else {
                    return callback('Nenhum dispositivo UART encontrado.', devices);
                }
            } catch (e) {
                return callback(err, devices);
            }
        }
    });
};


/**
 * identifica os dispositivos conectados
 * @returns array
 */
var identify = function (callback) {
    let devices = [];

    exec('impact', ['-batch ./run_impact/identify.cmd'], (error, stdout, stderr) => {
        if (error) {
            console.error('Oh no, there was an error: ' + error.message);
            return callback(error.message, devices);
        } else {
            let error = null;
            try {
                let arr = stdout.split('\n'),
                    found = false;

                for (let el of arr) {

                    if (found && (el.indexOf('--------------') >= 0))
                        break;

                    if (found)
                        devices.push(parse_device_name(el));


                    if (el.indexOf('Position') >= 0)
                        found = true;
                }
            } catch (e) {
                error = e;
                console.error(e);
            }

            return callback(error, devices);
        }
    });
};


function parse_device_name(str) {
    if (typeof str === 'string') {
        let arr = str.split(/[\s]/gi).filter((el) => {
            if (el.length)
                return el;
        });

        return arr[0] + ' - ' + arr[1];
    } else return '';
}


module.exports = {
    identify: identify,
    list_uart_port: list_uart_port
};