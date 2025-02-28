import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export interface AvatarModel extends Model {
  id: number;
  userId: number;
  hair: string;
  face: string;
  eyes: string;
  outfit: string;
  currentX: number;
  currentY: number;
}

const Avatar = sequelize.define<AvatarModel>("Avatar", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  hair: {
    type: DataTypes.STRING,
    defaultValue: "default",
  },
  face: {
    type: DataTypes.STRING,
    defaultValue: "default",
  },
  eyes: {
    type: DataTypes.STRING,
    defaultValue: "default",
  },
  outfit: {
    type: DataTypes.STRING,
    defaultValue: "default",
  },
  currentX: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  currentY: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

export default Avatar;
