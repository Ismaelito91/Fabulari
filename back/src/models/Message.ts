import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export interface MessageModel extends Model {
  id: number;
  userId: number;
  roomId: number;
  content: string;
  createdAt: Date;
}

const Message = sequelize.define<MessageModel>("Message", {
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
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Rooms",
      key: "id",
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export default Message;
