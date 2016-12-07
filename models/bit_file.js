/**
 * Created by Cristiano on 29/10/2016.
 * https://github.com/CristSky/
 * VLab
 */
"use strict";
module.exports = (sequelize, DataTypes) => {
    const BitFile = sequelize.define('BitFile', {
            filename: {
                type: DataTypes.STRING,
                allowNull: false
            },
            destination: {
                type: DataTypes.STRING,
                allowNull: false
            },
            originalname: {
                type: DataTypes.STRING,
                allowNull: false
            },
            desc: {
                type: DataTypes.STRING
            }
        },
        {
            classMethods: {
                associate: (models) => {
                    BitFile.belongsTo(models.User);
                }
            }
        });
    return BitFile;
};