'use strict';


module.exports = function(sequelize, DataTypes) {
    var MarketPrice = sequelize.define('MarketPrice', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },


        tradeDate: {                           //交易日期
            type: DataTypes.DATE
        },
        contractName:{
            type: DataTypes.STRING(10)
        },

        openPrice: {             //
            type: DataTypes.DOUBLE
        },
        closePrice:{              //
          type: DataTypes.DOUBLE
        },
        settlePrice: {             //
            type: DataTypes.DOUBLE
        },
        highestPrice:{              //
          type: DataTypes.DOUBLE
        },
        lowestPrice: {             //
            type: DataTypes.DOUBLE
        },
        defferedCharge:{
            type: DataTypes.DOUBLE
        },
        defferedChargeType:{
            type: DataTypes.DOUBLE
        }

    }, {

        classMethods: {

            associate: function(db) {

                db.MarketPrice.belongsTo(db.Contract, {
                    as: 'contract',
                    onDelete:'RESTRICT'
                });



            }
        }
    });

    return MarketPrice;
};
