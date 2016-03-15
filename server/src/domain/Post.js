'use strict';


module.exports = function(sequelize, DataTypes) {
var Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },


    message: {
        type: DataTypes.STRING(4000)
    },
    createdTime: {
        type: DataTypes.DATE
    },
    updatedTime: {
        type: DataTypes.DATE
    }
}, {

    classMethods: {

        associate: function(db) {

            //db.Post.belongsTo(db.User, {
            //    as: 'From'
            //});
            //db.Post.hasMany(db.Comment);


        }
    }
});

return Post;
};
