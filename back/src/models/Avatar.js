const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Avatar = sequelize.define(
  "Avatar",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    hair: {
      type: DataTypes.STRING,
    },
    face: {
      type: DataTypes.STRING,
    },
    eyes: {
      type: DataTypes.STRING,
    },
    outfit: {
      type: DataTypes.STRING,
    },
    accessories: {
      type: DataTypes.STRING,
    },
    currentX: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    currentY: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Avatar;
