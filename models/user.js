/**
 * Created by Cristiano on 25/05/2016.
 * cristiano@live.jp
 */
"use strict";
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
            username: {
                type: DataTypes.STRING(21),
                allowNull: false,
                unique: true
            },
            nome: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            sobrenome: {
                type: DataTypes.STRING(50),
                allowNull: false
            },
            password: {
                type: DataTypes.STRING(70),
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            email: {
                type: DataTypes.STRING(70),
                unique: true,
                validate: {
                    notEmpty: true
                }
            },
            accessLevel: {
                type: DataTypes.INTEGER(1)
            }
        },
        {
            hooks: {
                beforeCreate: (user, options, fn) => {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) {
                            return next(err, false);
                        } else {
                            bcrypt.hash(user.password, salt, (err, hash) => {
                                if (err) {
                                    return next(err, false);
                                } else {
                                    user.accessLevel = user.accessLevel ? user.accessLevel : 0;
                                    user.password = hash;
                                    return fn(null, user);
                                }
                            });
                        }
                    });
                }
            },
            instanceMethods: {
                isValidPassword: function (password, done) {
                    bcrypt.compare(password, this.password, function (err, res) {
                        if (err) return done(err, null);
                        else return done(null, res);
                    });
                }
            },
            classMethods: {
                associate: (models) => {
                    User.hasMany(models.BitFile);
                }
            }
        });
    return User;
};