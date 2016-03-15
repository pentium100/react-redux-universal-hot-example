'use strict';


module.exports = function(sequelize, DataTypes) {

var User = sequelize.define('User', {

    id: {
        type: DataTypes.INTEGER(),
        primaryKey: true,
        autoIncrement: true
    },

    isEnabled: {
        type: DataTypes.BOOLEAN()
    },
    email: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.STRING(100)
    },
    picture: {
        type: DataTypes.BLOB()
    },
    factoryName: {
        type: DataTypes.STRING(100)
    },
    contractNo: {
        type: DataTypes.STRING(100)
    },
    batchNo: {
        type: DataTypes.INTEGER()
    }
}, {

    classMethods: {

        //associate: function(db) {
        //    db.User.belongsTo(db.Company);

        //}
    }
});


return User;
};
