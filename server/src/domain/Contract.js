'use strict';


module.exports = function(sequelize, DataTypes) {
  var Contract = sequelize.define('Contract', {
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

        db.Contract.belongsTo(db.Article, {as:'article', onDelete:'RESTRICT'});
      }
    }
  });

  return Contract;
};
