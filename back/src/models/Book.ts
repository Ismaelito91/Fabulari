import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export interface BookModel extends Model {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const Book = sequelize.define<BookModel>("Book", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  coverImage: {
    type: DataTypes.STRING,
    defaultValue: "default-cover.jpg",
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export default Book;
