const Sequelize = require("sequelize");

const db = require("../config/database");
const User = require("./User");

const UserResetPassword = db.define(
  "usersResetPasswords",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    resetToken: {
      type: Sequelize.STRING,
    },
    resetTokenExpiration: {
      type: Sequelize.DATE,
    },
    isActive: {
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: false,
  }
);

User.hasMany(UserResetPassword);
UserResetPassword.belongsTo(User);

module.exports = UserResetPassword;
