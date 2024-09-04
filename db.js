/** Database for lunchly */

const pg = require("pg");

const db = new pg.Client("postgres://mooks2022:mookster21@localhost/lunchly");

db.connect();

module.exports = db;
