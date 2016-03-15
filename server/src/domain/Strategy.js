'use strict';


module.exports = function(sequelize, DataTypes) {
    var Strategy = sequelize.define('Strategy', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },


        desc: {                           //策略描述
            type: DataTypes.STRING(4000)
        },
        direction1: {                 //合约一方向
            type: DataTypes.INTEGER
        },
        direction2: {             //合约二方向
            type: DataTypes.INTEGER
        },
        dateFrom:{              //开仓时间
          type: DataTypes.DATE
        }


    }, {

        classMethods: {

            associate: function(db) {

                db.Strategy.belongsTo(db.Contract, {
                    as: 'contract1',
                    onDelete:'RESTRICT'
                });

                db.Strategy.belongsTo(db.Contract, {
                    as: 'contract2',
                    onDelete:'RESTRICT'
                });


            }
        }
    });

    return Strategy;
};
