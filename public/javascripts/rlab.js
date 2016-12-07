/**
 * Created by Cristiano on 30/09/2016.
 * https://github.com/CristSky/
 * RLab
 */
"use strict";
var RLab = (function () {
    var rlab = {},
        btn_logout, main, view_config, bit_upload, lab_area, device, tx, frx, rx, rst, download;

    document.addEventListener('DOMContentLoaded', function () {
        $('input[type=file]').bootstrapFileInput();
        $('.file-inputs').bootstrapFileInput();
        main = document.getElementById('main');
        view_config = document.getElementById('view_config');
        lab_area = document.getElementById('lab_area');
        bit_upload = document.getElementById('bit_upload');
        btn_logout = document.getElementById('btn-logout');
        download = document.getElementById('download');

        // faz logout
        btn_logout.addEventListener('click', function () {
            rlab.ajax('DELETE', '/login', function () {
                location.reload();
            });
        }, true);


        if (view_config) {
            rlab.ajax('get', '/config/dispositivos', function (data) {
                if (data) {
                    view_config.className = 'hidden';
                    listar_dispositivos_portas(JSON.parse(data));
                }
            });
        }

        if (bit_upload) {
            document.getElementById('li_bit_upload').className = 'active';
        }

        if (download) {
            document.getElementById('li_download').className = 'active';
        }

        if (lab_area) {
            device = document.getElementById('device').value;
            rst = document.getElementById('rst');
            tx = document.getElementById('tx');
            frx = document.getElementById('frx');
            rx = document.getElementById('rx');
            populate_sw();


            setInterval(() => {
                rlab.ajax('GET', '/lab_area/txdata/' + device, function (response) {
                    let data = JSON.parse(response);
                    for (let el of data) {
                        tx.value += 'ASCII: ' + String.fromCharCode(el.data) + ' - HEX: ' + parseInt(el.data).toString(16) + ' - Binário: ' + ('00000000' + (parseInt(el.data, 16)).toString(2)).slice(-8) + '\n';
                        tx.scrollTop = tx.scrollHeight;
                    }
                })
            }, 1000);

            rst.addEventListener('click', function () {
                location.reload();
            });

            frx.addEventListener('submit', function (e) {
                e.preventDefault();

                rlab.ajax('POST', '/lab_area/rx/' + device, JSON.stringify({rx: rx.value}), () => {
                });
                frx.reset();
            })
        }
    });


    function populate_sw() {
        var sw_panel = document.getElementById('sw_panel');
        let div, label, input, span;

        sw_panel.innerHTML = '';

        for (let i = 0; i <= 15; i++) {
            div = document.createElement('div');
            label = document.createElement('label');
            input = document.createElement('input');
            span = document.createElement('span');

            div.className = 'checkbox checkbox-slider--b';
            input.type = 'checkbox';
            input.id = i;
            span.innerHTML = 'Switch ' + ('0' + (i + 1)).slice(-2);

            input.addEventListener('change', function (e) {
                console.log(e.target.id, e.target.checked);
                let data = {
                    swi: e.target.id,
                    tipo: (e.target.checked ? 'l' : 'd')
                };

                rlab.ajax('POST', '/lab_area/sw/' + device, JSON.stringify(data), () => {
                });

            });

            label.appendChild(input);
            label.appendChild(span);
            div.appendChild(label);
            sw_panel.appendChild(div);
        }
    }


    function listar_dispositivos_portas(obj) {
        if (obj) {
            var fpga_list = document.getElementById('fpga_list');
            for (let fpga of obj.fpga) {
                let input = document.createElement('input'),
                    input2 = document.createElement('input'),
                    fieldset = document.createElement('fieldset'),
                    select = document.createElement('select'),
                    col1 = document.createElement('div'),
                    col2 = document.createElement('div'),
                    col3 = document.createElement('div'),
                    option = document.createElement('option');

                col1.className = 'col-md-4';
                col2.className = 'col-md-2';
                col3.className = 'col-md-6';
                fieldset.className = 'form-group row';
                select.className = 'form-control';
                select.name = 'port';
                select.appendChild(option);

                select.addEventListener('change', function (e) {
                    var sel = document.getElementsByName('port'), qtd = 0, val = 0;

                    for (let el of sel) {
                        if (e.target.value == el.value) {
                            qtd++;
                        }

                        val += el.value.length;

                        if (qtd > 1)
                            e.target.value = '';
                    }

                    document.getElementById('fpga_list_send').disabled = val == 0;
                });

                for (let uart of obj.uart) {
                    option = document.createElement('option');
                    option.innerHTML = uart.comName;
                    select.appendChild(option);
                }

                input.readOnly = true;
                input.type = 'text';
                input.className = 'form-control';
                input.name = 'fpga';
                input.value = fpga;
                input2.type = 'text';
                input2.className = 'form-control';
                input2.name = 'camera_url';

                col1.appendChild(input);
                col2.appendChild(select);
                col3.appendChild(input2);
                fieldset.appendChild(col1);
                fieldset.appendChild(col2);
                fieldset.appendChild(col3);

                fpga_list.appendChild(fieldset);
            }
        }
    }

    /**
     * ajax helper
     * @param method string
     * @param url string
     * @param data object | function
     * @param fn function | undefined
     */
    rlab.ajax = function (method, url, data, fn) {
        var xhttp = new XMLHttpRequest();
        var callback, sendData;

        callback = typeof data === 'function' ? data : fn;
        if (typeof data === 'function') {
            callback = data;
            sendData = null;
        } else {
            sendData = data;
            callback = fn;
        }

        if (typeof callback == 'function') {
            xhttp.onreadystatechange = function () {
                if (xhttp.readyState == 4) {
                    if (xhttp.responseURL.indexOf('/login') < 0)
                        return callback(xhttp.response);
                    else location.reload();
                }
            };
        }

        xhttp.open(method, url, true);
        method == 'POST' ? xhttp.setRequestHeader('Content-Type', 'application/json') : null;
        xhttp.send(sendData);
    };


    return rlab;
})();


/*
 Bootstrap - File Input
 ======================

 This is meant to convert all file input tags into a set of elements that displays consistently in all browsers.

 Converts all
 <input type="file">
 into Bootstrap buttons
 <a class="btn">Browse</a>

 */
(function ($) {

    $.fn.bootstrapFileInput = function () {

        this.each(function (i, elem) {

            var $elem = $(elem);

            // Maybe some fields don't need to be standardized.
            if (typeof $elem.attr('data-bfi-disabled') != 'undefined') {
                return;
            }

            // Set the word to be displayed on the button
            var buttonWord = 'Browse';

            if (typeof $elem.attr('title') != 'undefined') {
                buttonWord = $elem.attr('title');
            }

            var className = '';

            if (!!$elem.attr('class')) {
                className = ' ' + $elem.attr('class');
            }

            // Now we're going to wrap that input field with a Bootstrap button.
            // The input will actually still be there, it will just be float above and transparent (done with the CSS).
            $elem.wrap('<a class="file-input-wrapper btn btn-default ' + className + '"></a>').parent().prepend($('<span></span>').html(buttonWord));
        })

        // After we have found all of the file inputs let's apply a listener for tracking the mouse movement.
        // This is important because the in order to give the illusion that this is a button in FF we actually need to move the button from the file input under the cursor. Ugh.
            .promise().done(function () {

            // As the cursor moves over our new Bootstrap button we need to adjust the position of the invisible file input Browse button to be under the cursor.
            // This gives us the pointer cursor that FF denies us
            $('.file-input-wrapper').mousemove(function (cursor) {

                var input, wrapper,
                    wrapperX, wrapperY,
                    inputWidth, inputHeight,
                    cursorX, cursorY;

                // This wrapper element (the button surround this file input)
                wrapper = $(this);
                // The invisible file input element
                input = wrapper.find("input");
                // The left-most position of the wrapper
                wrapperX = wrapper.offset().left;
                // The top-most position of the wrapper
                wrapperY = wrapper.offset().top;
                // The with of the browsers input field
                inputWidth = input.width();
                // The height of the browsers input field
                inputHeight = input.height();
                //The position of the cursor in the wrapper
                cursorX = cursor.pageX;
                cursorY = cursor.pageY;

                //The positions we are to move the invisible file input
                // The 20 at the end is an arbitrary number of pixels that we can shift the input such that cursor is not pointing at the end of the Browse button but somewhere nearer the middle
                var moveInputX = cursorX - wrapperX - inputWidth + 20;
                // Slides the invisible input Browse button to be positioned middle under the cursor
                var moveInputY = cursorY - wrapperY - (inputHeight / 2);

                // Apply the positioning styles to actually move the invisible file input
                input.css({
                    left: moveInputX,
                    top: moveInputY
                });
            });

            $('body').on('change', '.file-input-wrapper input[type=file]', function () {

                var fileName;
                fileName = $(this).val();

                // Remove any previous file names
                $(this).parent().next('.file-input-name').remove();
                if (!!$(this).prop('files') && $(this).prop('files').length > 1) {
                    fileName = $(this)[0].files.length + ' files';
                }
                else {
                    fileName = fileName.substring(fileName.lastIndexOf('\\') + 1, fileName.length);
                }

                // Don't try to show the name if there is none
                if (!fileName) {
                    return;
                }

                var selectedFileNamePlacement = $(this).data('filename-placement');
                if (selectedFileNamePlacement === 'inside') {
                    // Print the fileName inside
                    $(this).siblings('span').html(fileName);
                    $(this).attr('title', fileName);
                } else {
                    // Print the fileName aside (right after the the button)
                    $(this).parent().after('<span class="file-input-name">' + fileName + '</span>');
                }
            });

        });

    };

// Add the styles before the first stylesheet
// This ensures they can be easily overridden with developer styles
    var cssHtml = '<style>' +
        '.file-input-wrapper { overflow: hidden; position: relative; cursor: pointer; z-index: 1; }' +
        '.file-input-wrapper input[type=file], .file-input-wrapper input[type=file]:focus, .file-input-wrapper input[type=file]:hover { position: absolute; top: 0; left: 0; cursor: pointer; opacity: 0; filter: alpha(opacity=0); z-index: 99; outline: 0; }' +
        '.file-input-name { margin-left: 8px; }' +
        '</style>';
    $('link[rel=stylesheet]').eq(0).before(cssHtml);

})(jQuery);


