/**
 * Created by Cristiano on 04/11/2016.
 * https://github.com/CristSky/
 * RLab
 */
"use strict";
module.exports = (sequelize, DataTypes) => {
    const Device = sequelize.define('Device', {
            id: {
                type: DataTypes.INTEGER(3),
                allowNull: false,
                primaryKey: true
            },
            dispositivo: {
                type: DataTypes.STRING,
                allowNull: false
            },
            porta: {
                type: DataTypes.STRING,
                allowNull: false
            },
            camera_ip: {
                type: DataTypes.STRING,
                allowNull: false
            }
        },
        {
            classMethods: {
                associate: (models) => {
                }
            }
        });
    return Device;
};