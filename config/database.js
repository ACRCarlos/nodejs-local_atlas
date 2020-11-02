const { Sequelize } = require("sequelize");
const config = require("config");
const dbname = config.get("dbname");
const dbuser = config.get("dbuser");
const dbpassword = config.get("dbpassword");
const host = config.get("host");

module.exports = new Sequelize(dbname, dbuser, dbpassword, {
  host: host,
  dialect: "mysql",
});
