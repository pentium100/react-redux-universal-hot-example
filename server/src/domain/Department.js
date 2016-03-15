/**
 * Created by lenovo on 2016.3.4.
 */
'use strict';


module.exports = function(sequelize, DataTypes) {
    var Department = sequelize.define('Department', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },


        name: {
            type: DataTypes.STRING(20)
        }


    }, {

        classMethods: {

            associate: function(db) {




            }
        }
    });

    return Department;
};
