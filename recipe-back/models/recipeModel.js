const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recipe = sequelize.define('Recipe', {
  name: { type: DataTypes.STRING, allowNull: false },
  ingredients: { type: DataTypes.TEXT, allowNull: false },
  instructions: { type: DataTypes.TEXT, allowNull: false },
  cuisineType: { type: DataTypes.STRING },
  preparationTime: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('favorite', 'to try', 'made before'), allowNull: true },
  metadata: { type: DataTypes.TEXT, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: true }, // New field!**
  flavor: { type: DataTypes.STRING, allowNull: true },

});

module.exports = Recipe;
