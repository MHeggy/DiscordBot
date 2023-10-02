const mysql = require('mysql2');
const main = require('./main.js');
//establishing the connection with a named function.
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'phpuser',
  password: 'phpuser',
  database: 'discord_test',
});

function insertUserData(userId, username, discriminator, balance, callback) {
    // Grab the guild by ID
  const guildId = '1157406149147119706'; // Replace with your actual guild ID
  const guild = client.guilds.cache.get(guildId);

  if (guild) {
    // Fetch members and insert them into the database
    guild.members.fetch().then((members) => {
      members.forEach((member) => {
        const userId = member.id;
        const username = member.user.username;
        const balance = 0;
        const discriminator = member.user.discriminator;
        //SQL statement.
        const sql = 'INSERT INTO users (user_id, user_name, discriminator, balance_amount) VALUES (?, ?, ?, ?)';
        connection.query(sql, [userId, username, discriminator, balance], (error, results) => {
          if (error) {
            console.error('Error inserting member data:', error);
          }
        });
      });
    }).catch((error) => {
      console.error('Error fetching guild members:', error);
    });
  } else {
    console.error(`Guild with ID ${guildId} not found.`);
  }
}

connection.connect((err) => {
    if(err) {
      //logging errors.
      console.error('Error connecting to MySQL:', err);
      return;
    }
    //log if successful.
    console.log('Connected to MySQL database')
  });

module.exports = {
    insertUserData,
    connection, //export the connection so other modules can access it.
};