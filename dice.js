const mysql = require('mysql2');
const main = require('./main.js');
//establishing the connection with a named function.
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'phpuser',
  password: 'phpuser',
  database: 'discord_test',
});