'use strict';

module.exports = function(sequelize, DataTypes) {
  var POS = sequelize.define('POS', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    number: {
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING(400)
    },
    bank: {
      type: DataTypes.STRING(400)
    },
    desc: {
      type: DataTypes.STRING(400)
    }
  });

  return POS;

};
