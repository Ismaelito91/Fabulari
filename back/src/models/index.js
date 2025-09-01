const User = require("./User");
const Room = require("./Room");
const Message = require("./Message");
const Book = require("./Book");
const Avatar = require("./Avatar");

// Associations
User.hasOne(Avatar);
Avatar.belongsTo(User);

User.hasMany(Message);
Message.belongsTo(User);

Room.hasMany(Message);
Message.belongsTo(Room);

Book.hasMany(Room);
Room.belongsTo(Book);

module.exports = {
  User,
  Room,
  Message,
  Book,
  Avatar,
};
