'use strict';


module.exports = function(sequelize, DataTypes) {
  var TradeBook = sequelize.define('TradeBook', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },


    desc: {
      type: DataTypes.STRING(4000)
    },
    bookType: {
      type: DataTypes.STRING(4)
    },
    broker: {
      type: DataTypes.STRING(50)
    },
    bookNo: {
      type: DataTypes.STRING(50)
    }


  }, {

    classMethods: {

      associate: function(db) {

        db.TradeBook.belongsTo(db.Company, {
          as: 'company',
          onDelete: 'RESTRICT'
        });


      }
    }
  });

  return TradeBook;
};
