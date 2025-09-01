const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    positionX: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    positionY: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Message;
