/**
 * Created by Cristiano on 24/05/2016.
 * cristiano@live.jp
 */
"use strict";
const fs = require("fs"),
    path = require("path"),
    Sequelize = require("sequelize"),
    env = process.env.NODE_ENV || "development",
    config = require(path.join(__dirname, '..', 'config', 'config.json'))[env],
    sequelize = new Sequelize(config.database, config.username, config.password, {timezone: 'America/Sao_Paulo'}),
    db = {};


function getModels(dirname) {
    fs
        .readdirSync(dirname)
        .filter((file) => {
            if (fs.statSync(path.join(dirname, file)).isDirectory()) {
                getModels(path.join(dirname, file));
            } else
                return (file.indexOf(".") !== 0) && (file !== "index.js");
        })
        .forEach((file) => {
            if (file) {
                const model = sequelize.import(path.join(dirname, file));
                db[model.name] = model;
            }
        });

    Object.keys(db).forEach((modelName) => {
        if ("associate" in db[modelName]) {
            db[modelName].associate(db);
        }
    });

}

getModels(__dirname);


db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;