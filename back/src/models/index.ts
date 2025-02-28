import { Sequelize } from "sequelize";
import User from "./User";
import Avatar from "./Avatar";
import Room from "./Room";
import Message from "./Message";
import Book from "./Book";
import type { UserModel } from "./User";
import type { AvatarModel } from "./Avatar";
import type { RoomModel } from "./Room";
import type { MessageModel } from "./Message";
import type { BookModel } from "./Book";
import { sequelize } from "../config/database";

interface DB {
  sequelize: Sequelize;
  User: typeof User;
  Avatar: typeof Avatar;
  Room: typeof Room;
  Message: typeof Message;
  Book: typeof Book;
}

// Définir les associations
User.hasOne(Avatar, {
  foreignKey: "userId",
  as: "avatar",
});
Avatar.belongsTo(User, {
  foreignKey: "userId",
});

// Associations pour les messages
User.hasMany(Message, {
  foreignKey: "userId",
  as: "messages",
});
Message.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

Room.hasMany(Message, {
  foreignKey: "roomId",
  as: "messages",
});
Message.belongsTo(Room, {
  foreignKey: "roomId",
  as: "room",
});

const db: DB = {
  sequelize,
  User,
  Avatar,
  Room,
  Message,
  Book,
};

export type { UserModel, AvatarModel, RoomModel, MessageModel, BookModel };
export default db;
