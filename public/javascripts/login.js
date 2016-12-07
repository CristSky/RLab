/**
 * Created by Cristiano on 29/10/2016.
 * https://github.com/CristSky/
 * VLab
 */
"use strict";
var VLab = (function () {
    var vlab = {}, change = false,
        login_cad, login_cadastrar, form_login, login_submit, login_msg, login_alert;
    document.addEventListener('DOMContentLoaded', function () {
        login_cad = document.getElementById('login_cad');
        login_cadastrar = document.getElementById('login_cadastrar');
        form_login = document.getElementById('form_login');
        login_submit = document.getElementById('login_submit');
        login_msg = document.getElementById('login_msg');
        login_alert = document.getElementById('login_alert');

        login_cad.addEventListener('click', () => {
            login_cadastrar.disabled = change;
            change = !change;
            form_login.reset();
            login_alert.innerHTML = '';
            login_msg.innerHTML = change ? 'R-Lab Cadastrar' : 'R-Lab Entrar';
            login_cad.innerHTML = change ? '< Voltar' : 'Cadastrar';
            form_login.action = change ? '/login/cadastro' : '';
            login_cadastrar.className = change ? 'form-group' : 'form-group hidden';
            login_submit.innerHTML = change ? 'Enviar' : 'Entrar';
        }, true);
    });
    return vlab;
})();