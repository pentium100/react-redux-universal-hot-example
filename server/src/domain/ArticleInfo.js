'use strict';


module.exports = function(sequelize, DataTypes) {
    var ArticleInfo = sequelize.define('ArticleInfo', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },


        premium: {
            type: DataTypes.DOUBLE
        },
        defferedCharge:{

            type: DataTypes.DOUBLE

        },
        dateFrom:{

            type:DataTypes.DATEONLY
        }
    }, {

      classMethods: {

        associate: function(db) {

          db.ArticleInfo.belongsTo(db.Article, {as:'article'});
        }
      }
    });

    return ArticleInfo;
};
