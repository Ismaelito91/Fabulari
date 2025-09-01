const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Room = sequelize.define(
  "Room",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Room;
