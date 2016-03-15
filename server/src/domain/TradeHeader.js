'use strict';


module.exports = function(sequelize, DataTypes) {
  var TradeHeader = sequelize.define('TradeHeader', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    docType:{
      type: DataTypes.INTEGER   //单据类型   1-正常交易  2-移仓交易
    },

    desc:{                      //交易描述 ， 自动生成。
      type: DataTypes.STRING(50)
    },
    open: {
      type: DataTypes.INTEGER
    },
    priceDiff1: {    //即期价差
      type: DataTypes.DOUBLE
    },
    priceDiff2: {
      type: DataTypes.DOUBLE
    },
    tradeDate:{
      type: DataTypes.DATEONLY
    },
    closeProfit:{
      type:DataTypes.DOUBLE
    },
    currencyProfit:{
      type:DataTypes.DOUBLE
    },
    defferedCharge:{

      type:DataTypes.DOUBLE
    },

    closeAt:{
      type:DataTypes.DATEONLY
    }
  }, {

    classMethods: {

      associate: function(db) {

        db.TradeHeader.hasMany(db.TradeDetail, {
          as: 'details',
          onDelete:'CASCADE'
        });

        db.TradeHeader.belongsTo(db.TradeHeader, {   //平仓时的父ID, 移仓时的父ID
          as: 'parent',
          onDelete:'RESTRICT'
        });

        db.TradeHeader.belongsTo(db.TradeHeader, {
          as: 'moveFrom',
          onDelete:'CASCADE'
        });

        db.TradeHeader.belongsTo(db.TradeHeader, {
          as: 'moveTo',
          onDelete:'CASCADE'
        });

        db.TradeHeader.belongsTo(db.Strategy, {
          as: 'strategy',
          onDelete:'RESTRICT'
        });


      }
    }
  });

  return TradeHeader;
};
