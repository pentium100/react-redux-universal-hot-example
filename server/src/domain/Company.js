'use strict';


module.exports = function(sequelize, DataTypes) {
  var Company = sequelize.define('Company', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },


    name: {
      type: DataTypes.STRING(200)
    }


  });

  return Company;
};
