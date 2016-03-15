'use strict';


const unitTable = {
  'G-KG': 0.001,
  'KG-G': 1000,
  'OZ-G': 31.1034768,
  'G-OZ': 1/31.1034768,
  'KG-KG': 1,
  'G-G': 1,
  'OZ-OZ': 1,
  'TON-KG': 1000,
  'KG-TON': 0.001
};

function convertUnit(quantity, fromUnit, toUnit){

  return quantity*unitTable[fromUnit+'-'+toUnit];


};



module.exports = function(sequelize, DataTypes) {
  var TradeDetail = sequelize.define('TradeDetail', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    desc:{                      //交易描述 ， 自动生成。
      type: DataTypes.STRING(50)
    },

    seque:{
      //交易顺序号   1－第一腿， 2－第二腿  3－锁汇交易
      type: DataTypes.INTEGER
    },

    tradeDate: {
      type: DataTypes.DATEONLY
    },
    open: {    //开平标志
      type: DataTypes.INTEGER
    },
    direction: {
      type: DataTypes.INTEGER
    },

    quantity:{
      type: DataTypes.DOUBLE
    },

    closedQuantity:{                  //开仓记录的已平仓数量.
      type: DataTypes.INTEGER,
      defaultValue: 0
    },


    closeQuantity:{                    //移仓时的平仓数量
      type: DataTypes.INTEGER
    },

    unit:{
      type:DataTypes.STRING(10)
    },
    price:{
      type:DataTypes.DOUBLE
    },
    currency:{
      type:DataTypes.STRING(4)
    },
    exchangeCurrency:{
      type:DataTypes.STRING(4)
    },
    exchangeRate:{
      type:DataTypes.DOUBLE
    },
    dueDate: {
      type:DataTypes.DATEONLY

    },

    priceUnit: {
      type:DataTypes.STRING

    },
    memo: {
      type:DataTypes.STRING

    },

    diffUnit: {
      type:DataTypes.STRING

    },
    diffQuantity:{
      type: DataTypes.DOUBLE                 //以价差单位为数量的单位.
    },
    openPrice: {   //移仓开仓价
      type: DataTypes.DOUBLE
    },
    closePrice: {   //移仓平仓价
      type: DataTypes.DOUBLE
    },
    price2: {   //实际开平仓价
      type: DataTypes.DOUBLE
    },
    defferedCharge:{
      type: DataTypes.DOUBLE
    }


  }, {
    hooks:{

      beforeCreate:function(model, options, cb){
        model.diffQuantity = model.quantity;
        if(model.quantity>0&&model.seque!=3){
          var diffQuantity = convertUnit(model.quantity, model.unit, model.diffUnit);

          model.diffQuantity = diffQuantity;
        }
        cb();
      },
      beforeUpdate:function(model, options, cb){
        model.diffQuantity = model.quantity;
        if(model.quantity>0&&model.seque!=3){
          var diffQuantity = convertUnit(model.quantity, model.unit, model.diffUnit);
          model.diffQuantity = diffQuantity;
        }

        cb();

      },
    },
    classMethods: {

      associate: function(db) {
        db.TradeDetail.belongsTo(db.TradeBook, {as:'tradeBook', onDelete:'RESTRICT'});
        db.TradeDetail.belongsTo(db.TradeHeader, {as:'closeTo', onDelete:'RESTRICT'});
        db.TradeDetail.belongsTo(db.Contract, {as:'contract',  onDelete:'RESTRICT'});
        db.TradeDetail.belongsTo(db.TradeHeader, {as:'TradeHeader', onDelete:'CASCADE'});
      }
    }
  });

  return TradeDetail;
};
