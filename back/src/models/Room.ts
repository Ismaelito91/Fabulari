import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";

export interface RoomModel extends Model {
  id: number;
  name: string;
  description: string;
  backgroundImage: string;
  maxPlayers: number;
  createdAt: Date;
  updatedAt: Date;
}

const Room = sequelize.define<RoomModel>("Room", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  backgroundImage: {
    type: DataTypes.STRING,
    defaultValue: "default",
  },
  maxPlayers: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
});

export default Room;
