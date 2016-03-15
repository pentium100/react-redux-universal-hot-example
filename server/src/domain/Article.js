'use strict';


module.exports = function(sequelize, DataTypes) {
  var Article = sequelize.define('Article', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },


    name: {
      type: DataTypes.STRING(20)
    },
    market:{

      type: DataTypes.STRING(2)

    },
    currency:{
      type:DataTypes.STRING(4)
    },
    priceUnit:{

      type:DataTypes.STRING(5)
    },
    quantityUnit:{

      type:DataTypes.STRING(5)
    },
    defferedCharge:{
      type:DataTypes.DOUBLE
    },
    diffUnit:{

      type:DataTypes.STRING(5)
    }
  });

  return Article;
};
