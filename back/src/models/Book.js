const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Book = sequelize.define(
  "Book",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    genre: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    coverImage: {
      type: DataTypes.STRING,
    },
    isbn: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Book;
