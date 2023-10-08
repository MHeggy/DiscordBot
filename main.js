require('dotenv').config();
const crypto = require('crypto');
const { insertUserData, connection } = require('./database.js');
const { Client, Events, GatewayIntentBits, Permissions, PermissionsBitField, ButtonBuilder, ButtonStyle, SlashCommandBuilder, ActionRowBuilder, ChannelType, MessageCollector, MessageSelectMenu, ModalBuilder, TextInputBuilder, TextInputStyle, ModalSubmitInteraction, ModalSubmitFields, EmbedBuilder } = require('discord.js');
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
  const guildId = '1160364114036662302';
  const guild = client.guilds.cache.get(guildId);

  if (!guild) {
    console.error('Guild not found.');
    return;
  }

  //check if the admin role already exists.
  const adminRole = guild.roles.cache.find(role => role.name === 'Admin');
  if(!adminRole) {
    guild.roles.create({
      name: 'Admin',
      permissions: [
        PermissionsBitField.Flags.Administrator,
      ],
      color: 'Blue',
      reason: 'Admin Role Creation',
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
        name: 'User',
        permissions: [PermissionsBitField.Flags.ChangeNickname,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ChangeNickname,
        PermissionsBitField.Flags.Connect,
        PermissionsBitField.Flags.Speak,
        PermissionsBitField.Flags.ReadMessageHistory,
        ],
        color: 'Grey',
        reason: 'User Role creation',
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
        name: 'Muted',
        permissions: [PermissionsBitField.Flags.Connect,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
        color: 'Red',
        reason: 'Creating the muted role to mute a user.'
    })
    .then((role) => {
      console.log(`Created muted role with role ID: ${role.id}`);
    })
    .catch((error) => {
      console.error('Error creating muted role:', error);
    })
  }
})//end of role creation.


const prefix= "!"; //prefix for the command when user wants to use a command.


//sending pinned message.
client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Setting up code to make a pinned message in the chat.
  const channelId = '1160364114502230094'; // Replace with your channel ID.
  const dicingChannel = client.channels.cache.get(channelId);

  if (!dicingChannel) {
    console.error('Channel not found.');
    return;
  }

  try {
    // Check if there is already a pinned message in the channel.
    const existingPinnedMessages = await dicingChannel.messages.fetchPinned();
    
    if (existingPinnedMessages.size === 0) {
      // Create an embed for the introduction message.
      const introductionEmbed = {
        color: 0x0099FF,
        title: 'Welcome to DeathmatchGG!',
        description: 'Want to learn how to play? Check out <#1160364114502230092>.',
        fields: [
          {
            name: 'Fairness',
            value: 'We play fair here, want to make sure? Check it out here <#1160364114502230093>.',
          },
          {
            name: 'Rules',
            value: 'Before you get started, be sure to check out the server rules <#1160364114502230090>.',
          },
        ],
      };

      // Send the pinned message.
      const button = new ButtonBuilder()
        .setLabel('Play Games')
        .setCustomId('play_games')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      const sentMessage = await dicingChannel.send({ embeds: [introductionEmbed], components: [row] });
      await sentMessage.pin();
    } else {
      console.log('Introduction message already pinned:', existingPinnedMessages.first().content);
    }
  } catch (error) {
    console.error('Error:', error);
  }
});


//Creating a channel with the user and bot if the user clicks the 'play_games' button.
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'play_games') {
    if (!interaction.guild) {
      return interaction.reply('This command can only be done within the server.');
    }

    const user = interaction.user;
    const botId = client.user.id;
    const channelName = 'private-channel';

    // Create the private channel with permission overwrites.
    const channel = await interaction.guild.channels.create({
      name: `${channelName}`, // Use backticks for string interpolation.
      type: ChannelType.GuildText, // Use the correct constant.
      permissionOverwrites: [
        {
          id: user.id, // User's id.
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
        {
          id: botId, // Bot's id.
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
      ],
    });
    // Console logging an error.
    console.log('Created channel:', channel);

    // Create an introduction embed.
    const introductionEmbed = {
      color: 0x0099FF,
      title: `Welcome to your private channel, ${user.username}!`,
      description: 'You can click one of the buttons below to play:',
    };

    // Send the introduction embed.
    channel.send({ embeds: [introductionEmbed] });

    const houseButton = new ButtonBuilder()
      .setLabel('Play House')
      .setCustomId('play_house')
      .setStyle(ButtonStyle.Primary);

    const depositButton = new ButtonBuilder()
      .setLabel('Deposit')
      .setCustomId('deposit_button')
      .setStyle(ButtonStyle.Primary);

    const withdrawButton = new ButtonBuilder()
      .setLabel('Withdraw')
      .setCustomId('withdraw_button')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(houseButton, depositButton, withdrawButton);

    channel.send({ components: [row] });
  }
});



//second interaction handler for the play_house button.
// Inside your 'interactionCreate' event listener
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'play_house') {
    if (!interaction.guild) {
      return interaction.reply('This command can only be done within the server.');
    }

    const user = interaction.user;

    // Prompt the user to enter the bet amount
    const modal = new ModalBuilder()
      .setCustomId('amount_modal')
      .setTitle('Place your bet here.');

    // Listen for the user's input
    const betInput = new TextInputBuilder()
      .setCustomId('bet_amount')
      .setLabel('Enter Your Amount')
      .setPlaceholder('eg., 100')
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    const actionRow = new ActionRowBuilder().addComponents(betInput);

    modal.addComponents(actionRow);

    await interaction.showModal(modal);
  }
});

//event handler for amount modal submit
client.on(Events.InteractionCreate, async (interaction) => {
  if(!interaction.isModalSubmit()) return;
  if(interaction.isModalSubmit() && interaction.customId === 'amount_modal') {
    const userId = interaction.user.id;
    const betAmount = interaction.fields.getTextInputValue('bet_amount');
    if(!isNaN(betAmount) && betAmount > 0) {
      // bet amount is valid.
      console.log(`User enter a valid bet amount: ${betAmount}.`);
      playHouseGame(userId, betAmount, interaction);
    } else {
      //invalid bet amount.
      await interaction.reply('Please enter a valid positive number.')
    }
  }
});

//event handler for deposits
client.on(Events.InteractionCreate, async (interaction) => {
  if(!interaction.isButton()) return;
  if(interaction.customId === 'deposit_button') {
    const user = interaction.user;
    const modalDeposit = new ModalBuilder()
      .setCustomId('deposit_modal')
      .setTitle('Deposit Here');
    //Listen for the user's input.
    const depositInput1 = new TextInputBuilder()
    .setCustomId('deposit_input')
    .setLabel('Enter amount you want to deposit here.')
    .setPlaceholder('e.g., 100M')
    .setRequired(true)
    .setStyle(TextInputStyle.Short);
  const depositInput2 = new TextInputBuilder()
    .setCustomId('deposit_input_2')
    .setLabel('RSN')
    .setPlaceholder('')
    .setRequired(true)
    .setStyle(TextInputStyle.Short);
  const firstActionRow = new ActionRowBuilder().addComponents(depositInput1);
  const secondActionRow = new ActionRowBuilder().addComponents(depositInput2);

  modalDeposit.addComponents(firstActionRow, secondActionRow);

  await interaction.showModal(modalDeposit);
}
});

const { MessageEmbed } = require('discord.js');

// ...

//Creating a ticket for the user.
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.isModalSubmit() && interaction.customId === 'deposit_modal') {
    const user = interaction.user;
    const adminRoleName = 'Admin'; // Replace with the name of your Admin role.
    const channelName = 'private-channel';

    const guild = interaction.guild;

    // Find the admin role by name.
    const adminRole = guild.roles.cache.find((role) => role.name === adminRoleName);

    if (!adminRole) {
      return interaction.reply(`The "${adminRoleName}" role was not found.`);
    }

    // Create the private channel with permission overwrites for the user, admin role, and admin user.
    const channel = await interaction.guild.channels.create({
      name: `${channelName}-${user.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: user.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
        {
          id: adminRole.id, // Use the ID of the Admin role.
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
      ],
    });

    // Create an embed for the welcome message.
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Private Channel Created')
      .setDescription(`Welcome to your private channel, ${user} and members with the "${adminRoleName}" role!`)
      

    // Send the welcome message with the embed.
    await channel.send({ embeds: [embed] });

    // Notify the user about the created channel with an embed.
    const userEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setDescription(`A private channel has been created for you and members with the "${adminRoleName}" role. You can now communicate there.`)
      
    interaction.reply({ embeds: [userEmbed] });
  }
});


//Function for game logic.
// Create a function to handle the house game logic
function playHouseGame(userId, betAmount, interaction) {
  // Generating a random number between 0 and 1.
  const randomBytes = crypto.randomBytes(1);
  const randomValue = randomBytes[0] / 255.0;

  if (randomValue < 0.5) {
    // User loses, and the bet amount goes to the bot (house).
    const userLoss = betAmount;

    // Update user balance in the database (subtract the loss).
    connection.query(
      'UPDATE users SET balance_amount = balance_amount - ? WHERE user_id = ?',
      [userLoss, userId],
      (err, result) => {
        if (err) {
          console.error('Error updating user balance: ' + err.message);
          return;
        }
        if (result.affectedRows === 1) {
          // Update the bot's balance in the database (add the loss).
          const botUserId = client.user.id;
          connection.query(
            'UPDATE users SET balance_amount = balance_amount + ? WHERE user_id = ?',
            [userLoss, botUserId],
            (botErr, botResult) => {
              if (botErr) {
                console.error('Error updating bot balance: ' + botErr.message);
                return;
              }
              if (botResult.affectedRows === 1) {
                // Fetch and send the user's updated balance.
                connection.query(
                  'SELECT balance_amount FROM users WHERE user_id = ?',
                  [userId],
                  (fetchErr, fetchResult) => {
                    if (fetchErr) {
                      console.error('Error fetching user balance: ' + fetchErr.message);
                      return;
                    }
                    const updatedBalance = fetchResult[0]?.balance_amount || 0;
                    interaction.reply(`You lost ${userLoss} credits. Your updated balance is now: ${updatedBalance} credits.`);
                  }
                );
              } else {
                interaction.reply('Bot user not found.');
              }
            }
          );
        } else {
          interaction.reply('User not found.');
        }
      }
    );
  } else {
    // User wins.
    const userWinnings = betAmount * 1.9;

    // Update user balance in the database (add the winnings).
    connection.query(
      'UPDATE users SET balance_amount = balance_amount + ? WHERE user_id = ?',
      [userWinnings, userId],
      (err, result) => {
        if (err) {
          console.error('Error updating user balance: ' + err.message);
          return;
        }
        if (result.affectedRows === 1) {
          // Fetch and send the user's updated balance.
          connection.query(
            'SELECT balance_amount FROM users WHERE user_id = ?',
            [userId],
            (fetchErr, fetchResult) => {
              if (fetchErr) {
                console.error('Error fetching user balance: ' + fetchErr.message);
                return;
              }
              const updatedBalance = fetchResult[0]?.balance_amount || 0;
              interaction.reply(`You won ${userWinnings} credits. Your updated balance is now: ${updatedBalance} credits.`);
            }
          );
        } else {
          interaction.reply('User not found.');
        }
      }
    );
  }
}



//start of !b command since it just left.
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

//Command handler setup.
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
          const senderBalance = parseFloat(senderResults[0]?.balance_amount) || 0;

          // Fetch the mentioned user's balance from the database.
          const mentionedUserId = mentionedUser.id;
          const mentionedSql = 'SELECT balance_amount FROM users WHERE user_id = ?';
          connection.query(mentionedSql, [mentionedUserId], (mentionedError, mentionedResults) => {
            if (mentionedError) {
              console.error('Error fetching mentioned user balance:', mentionedError);
              message.reply('An error occurred while fetching the recipient\'s balance.');
            } else {
              const mentionedBalance = parseFloat(mentionedResults[0]?.balance_amount) || 0;
              if (senderBalance < tipAmount) {
                message.reply("You don't have enough gold to tip that amount.");
              } else {
                // Calculate new balances after the tip.
                const newSenderBalance = senderBalance - tipAmount;
                const newMentionedBalance = mentionedBalance + tipAmount;

                // Update the sender's balance in the database.
                const updateSenderSql = 'UPDATE users SET balance_amount = ? WHERE user_id = ?';
                connection.query(updateSenderSql, [newSenderBalance, senderUserId], (updateSenderError, updateSenderResults) => {
                  if (updateSenderError) {
                    console.error('Error updating sender balance:', updateSenderError);
                    message.reply('An error occurred while processing your tip.');
                  } else {
                    // Update mentioned user's balance in the database.
                    const updateMentionedSql = 'UPDATE users SET balance_amount = ? WHERE user_id = ?';
                    connection.query(updateMentionedSql, [newMentionedBalance, mentionedUserId], (updateMentionedError) => {
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
});  // End of !tip command


//Start of !mute <minutes> <@user> command.
client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "mute") {
      // Checking if the author has admin role.
      const adminRole = message.guild.roles.cache.find(role => role.name === 'Admin');
      if (!adminRole || !message.member.roles.cache.has(adminRole.id)) {
        message.reply("You don't have permission to use this command.");
        return;
      }
      
      //check if the command has the correct format. Usage: !mute <minutes> <@user>.
      if(args.length !== 2 || !message.mentions.users.size) {
        message.reply("Invalid code format. Usage: `!mute <minutes> <@user>`");
        return;
      }
      //extracting the mentioned user and mute duration.
      const mentionedUser = message.mentions.users.first();
      const muteDuration = parseInt(args[0]);

      //ensure that the muteDuration is a valid positive number.
      if(isNaN(muteDuration) || muteDuration <= 0) {
        message.reply("Invalid mute duration. Please specify a valid positive number.");
        return;
      }

      //get the muted role.
      const muteRole = message.guild.roles.cache.find(role => role.name === "Muted");

      //check if the "Muted" role exists.
      if(!muteRole) {
        message.reply('The "Muted" role does not exist. Please create it.');
        return;
      }

      // Get the member object of the mentioned user.
      const memberToMute = message.guild.members.cache.get(mentionedUser.id);

      // check if the member is already muted.
      if (memberToMute.roles.cache.has(muteRole.id)) {
        message.reply("This user is already muted.");
        return;
      }

      //mute the member by adding the "muted" role.
      memberToMute.roles.add(muteRole);
      message.reply(`Muted ${mentionedUser.tag} for ${muteDuration} minutes.`);

      setTimeout(() => {
        memberToMute.roles.remove(muteRole);
        message.channel.send(`Unmuted ${mentionedUser.tag} after ${muteDuration} minutes.`);
      }, muteDuration * 60000);
    }
  }
});//end of the mute command.


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
  // Automatically assign the user role to the new member.
  const userRole = member.guild.roles.cache.find(role => role.name === 'User');
  if (userRole) {
    member.roles.add(userRole)
    .then(() => {
      console.log(`Assigned "User" role to ${member.user.tag}`);
    })
    .catch((error) => {
      console.error('Error assigning "user" role', error);
    })
  }
});

function generateCryptographicRandom() {
  const randomBytes = crypto.randomBytes(1);
  const randomValue = randomBytes[0] / 255.0;
  return randomValue;
}


// Simplified !house command
client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore bot messages.
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const betAmount = parseFloat(args[0]);

  if (command === 'house') {
    if (isNaN(betAmount) || betAmount <= 0) {
      message.reply('Invalid bet amount. Please specify a valid positive number.');
      return;
    }

    // Generating a random number between 0 and 1.
    const randomNumber = Math.random();

    if (randomNumber < 0.5) {
      // User loses, and the bet amount goes to the bot (house).
      const userLoss = betAmount;

      // Update user balance in the database (subtract the loss).
      const userId = message.author.id;
      connection.query(
        'UPDATE users SET balance_amount = balance_amount - ? WHERE user_id = ?',
        [userLoss, userId],
        (err, result) => {
          if (err) {
            console.error('Error updating user balance: ' + err.message);
            return;
          }
          if (result.affectedRows === 1) {
            // Update the bot's balance in the database (add the loss).
            const botUserId = client.user.id;
            connection.query(
              'UPDATE users SET balance_amount = balance_amount + ? WHERE user_id = ?',
              [userLoss, botUserId],
              (botErr, botResult) => {
                if (botErr) {
                  console.error('Error updating bot balance: ' + botErr.message);
                  return;
                }
                if (botResult.affectedRows === 1) {
                  // Fetch and send the user's updated balance.
                  connection.query(
                    'SELECT balance_amount FROM users WHERE user_id = ?',
                    [userId],
                    (fetchErr, fetchResult) => {
                      if (fetchErr) {
                        console.error('Error fetching user balance: ' + fetchErr.message);
                        return;
                      }
                      const updatedBalance = fetchResult[0]?.balance_amount || 0;
                      message.reply(`You lost ${userLoss} credits. Your updated balance is now: ${updatedBalance} credits.`);
                    }
                  );
                } else {
                  message.reply('Bot user not found.');
                }
              }
            );
          } else {
            message.reply('User not found.');
          }
        }
      );
    } else {
      // User wins.
      const userWinnings = betAmount * 1.9;

      // Update user balance in the database (add the winnings).
      const userId = message.author.id;
      connection.query(
        'UPDATE users SET balance_amount = balance_amount + ? WHERE user_id = ?',
        [userWinnings, userId],
        (err, result) => {
          if (err) {
            console.error('Error updating user balance: ' + err.message);
            return;
          }
          if (result.affectedRows === 1) {
            // Fetch and send the user's updated balance.
            connection.query(
              'SELECT balance_amount FROM users WHERE user_id = ?',
              [userId],
              (fetchErr, fetchResult) => {
                if (fetchErr) {
                  console.error('Error fetching user balance: ' + fetchErr.message);
                  return;
                }
                const updatedBalance = fetchResult[0]?.balance_amount || 0;
                message.reply(`You won ${userWinnings} credits. Your updated balance is now: ${updatedBalance} credits.`);
              }
            );
          } else {
            message.reply('User not found.');
          }
        }
      );
    }
  }
});


//login to the client with the bot.
const botToken = process.env.TOKEN;
client.login(botToken);