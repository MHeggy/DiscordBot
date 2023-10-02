require('dotenv').config();
const { insertUserData, connection } = require('./database.js');
const { Client, GatewayIntentBits, Permissions } = require('discord.js');
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,            // To receive information about the guilds (servers)
    GatewayIntentBits.GuildMessages,      // To receive messages sent in guilds
    GatewayIntentBits.GuildMembers,       // To receive information about members in the guild.
    GatewayIntentBits.MessageContent,     // To receive information about the message content sent in chats.
    // Add other intents as needed
  ]
});

//roles | starting with Admin role.
client.on("ready", () => {
  //getting the guild where I want to set my roles.
  const guildId = '1157406149147119706';
  const guild = client.guilds.cache.get(guildId);

  if (!guild) {
    console.error('Guild not found.');
    return;
  }

  //check if the admin role already exists.
  const adminRole = guild.roles.cache.find(role => role.name === 'Admin');
  if(!adminRole) {
    guild.roles.create({
      data: {
      name: 'Admin',
      permissions: ["ADMINISTRATOR"],
      color: 'Red',
      reason: 'Admin Role Creation',
    }
    })
    .then((role) => {
      console.log(`Created Admin role with the role ID: ${role.id}`);
    })
    .catch((error) => {
      console.error('Error creating Admin role:', error);
    })
  } // end of admin role setup.
  // start of userRole creation.
  const userRole = guild.roles.cache.find(role => role.name === 'User');
  if(!userRole) {
    guild.roles.create({
      data: {
        name: 'User',
        permissions: ["SEND_MESSAGES", "SPEAK", "CONNECT", "VIEW_CHANNEL", "READ_MESSAGE_HISTORY"],
        color: 'Grey',
        reason: 'User Role creation',
      }
    })
    .then((role) => {
      console.log(`Created User role with role ID: ${role.id}`);
    })
    .catch((error) => {
      console.error('Error creating User role: ', error);
    })
  }
  
  //start of mutedRole creation.
  const mutedRole = guild.roles.cache.find(role => role.name === 'Muted');
  if(!mutedRole) {
    guild.roles.create({
      data: {
        name: 'Muted',
        permissions: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "CONNECT"],
        color: 'Red',
        reason: 'Creating the muted role to mute a user.'
      }
    })
  }
})//end of role creation.

//start of mutedRole.
client.on
const prefix= "!"; //prefix for the command when user wants to use a command.

//when logging in, log statement to the console.
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

//Command handler setup.
client.on("messageCreate", (message) => { //start of !b command.
  if(message.author.bot) return; //ignore anymessages from bots.
  if(message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase(); // Defining the command.
    if(command === "b") {
      //fetch users id from the database.
      const userId = message.author.id;
      const sql = 'SELECT balance_amount FROM users WHERE user_id = ?';
      connection.query(sql, [userId], (error, results) => {
        if(error) {
          console.error('Error fetching balance:', error);
          message.reply('An error occurred while fetch your balance.');
        }
        else {
          const userBalance = parseFloat(results[0]?.balance_amount) || 0. // Parse as a float and default to 0 if not a valid number.
          if(!isNaN(userBalance)) {
            message.reply(`Your balance is ${userBalance.toFixed(2)} gold.`)
          } else {
            message.reply('Invalid balance data retrieved from the database.')
          }
        }
      })
    }
  }
}); // end of !b command.

//start of !tip command.
// Updated !tip command
client.on("messageCreate", (message) => {
  if (message.author.bot) return; // Ignore this from bots.
  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if (command === "tip") {
      // Check if the command has the correct format: !tip <@user> <amount>.
      if (args.length !== 2 || !message.mentions.users.size) {
        message.reply("Invalid command format. Usage: `!tip <@user> <amount>`");
        return;
      }

      // Extract the mentioned user and tip amount.
      const mentionedUser = message.mentions.users.first();
      const tipAmount = parseInt(args[1]);
      console.log('Parsed tip:', tipAmount);

      // Check if the tip amount is a valid number.
      if (isNaN(tipAmount) || tipAmount <= 0) {
        message.reply("Invalid tip amount. Please specify a valid positive number.");
        return;
      }

      // Fetch the sender's balance from the database.
      const senderUserId = message.author.id;
      const senderSql = 'SELECT balance_amount FROM users WHERE user_id = ?';
      connection.query(senderSql, [senderUserId], (senderError, senderResults) => {
        if (senderError) {
          console.error('Error fetching sender balance:', senderError);
          message.reply('An error occurred while fetching your balance.');
        } else {
          const senderBalance = parseInt(senderResults[0]?.balance_amount) || 0;
          //console logging the sender balance real quick.
          console.log('Sender Balance:', senderBalance);
          console.log('Sender ID:', senderUserId);
          // Fetch the mentioned user's balance from the database.
          const mentionedUserId = parseInt(mentionedUser.id);
          const mentionedSql = 'SELECT balance_amount FROM users WHERE user_id = ?';
          connection.query(mentionedSql, [mentionedUserId], (mentionedError, mentionedResults) => {
            if (mentionedError) {
              console.error('Error fetching mentioned user balance:', mentionedError);
              message.reply('An error occurred while fetching the recipient\'s balance.');
            } else {
              const mentionedBalance = parseInt(mentionedResults[0]?.balance_amount) || 0;
              if (senderBalance < tipAmount) {
                message.reply("You don't have enough gold to tip that amount.");
              } else {
                // Calculate new balances after the tip.
                const newSenderBalance = senderBalance - tipAmount;
                const newMentionedBalance = mentionedBalance + tipAmount;

                // Update the sender's balance in the database.
                const updateSenderSql = 'UPDATE users SET balance_amount = ? WHERE user_id = ?';
                connection.query(updateSenderSql, [newSenderBalance, senderUserId], (updateSenderError) => {
                  if (updateSenderError) {
                    console.error('Error updating sender balance:', updateSenderError);
                    message.reply('An error occurred while processing your tip.');
                  } else {
                    // Update mentioned user's balance in database.
                    const updateMentionedSql = 'UPDATE users SET balance_amount = ? WHERE user_id = ?';
                    connection.query(updateMentionedSql, [newMentionedBalance, mentionedUserId], updateMentionedError => {
                      if (updateMentionedError) {
                        console.error('Error updating mentioned user balance:', updateMentionedError);
                        message.reply('An error occurred while processing the tip.');
                      } else {
                        // Send a confirmation message.
                        message.reply(`You tipped ${mentionedUser.tag} ${tipAmount} gold.`);
                      }
                    });
                  }
                });
              }
            }
          });
        }
      });
    }
  }
}); // End of !tip command


// Getting the bot to send a message when users join the server. | Functions.
client.on('guildMemberAdd', (member) => {
  const genChatId = '1157406149147119710'; // Replace with the correct channel ID
  const generalChat = member.guild.channels.cache.get(genChatId); // Use the same variable name
  
  // Move the console.log below the assignment
  console.log(`General Chat Channel: ${generalChat}`);

  if (generalChat) {
    generalChat.send(`Welcome ${member.user.tag} to the server!`);
  }
  //insert user data into the database when a new member joins the server.
  insertUserData(member.id, member.user.username, member.user.discriminator, 0, (error) => {
    if(error) {
      console.error('Error inserting member data:', error);
    }
  })
});

//login to the client with the bot.
const botToken = process.env.TOKEN;
client.login(botToken);