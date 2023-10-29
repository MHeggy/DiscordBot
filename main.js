require('dotenv').config();
const crypto = require('crypto');
const { insertUserData, connection } = require('./database.js');
const { Client, 
  Events, 
  GatewayIntentBits, 
  Permissions, 
  PermissionsBitField, 
  ButtonBuilder, 
  ButtonStyle, 
  SlashCommandBuilder, 
  ActionRowBuilder,
  ChannelType, 
  MessageCollector, 
  MessageSelectMenu, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ModalSubmitInteraction, 
  ModalSubmitFields, 
  EmbedBuilder,
  GuildTextThreadManager, 
  ActionRow} = require('discord.js');
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,            // To receive information about the guilds (servers)
    GatewayIntentBits.GuildMessages,      // To receive messages sent in guilds
    GatewayIntentBits.GuildMembers,       // To receive information about members in the guild.
    GatewayIntentBits.MessageContent,     // To receive information about the message content sent in chats.
    // Add other intents as needed
  ]
});

client.setMaxListeners(100);

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
  const welcomeChannel = client.channels.cache.get(channelId);

  if (!welcomeChannel) {
    console.error('Channel not found.');
    return;
  }

  try {
    // Check if there is already a pinned message in the channel.
    const existingPinnedMessages = await welcomeChannel.messages.fetchPinned();
    
    if (existingPinnedMessages.size === 0) {
      // Create an embed for the introduction message.
      const introductionEmbed = {
        color: 0x0099FF,
        title: 'Welcome to DeathmatchGG!',
        description: 'Want to learn how to play? Check out <#1160364114502230092>.',
        thumbnail: {
          url: 'https://i.imgur.com/QrcYTuf.gif',
        },
        image: {
          url: 'https://i.imgur.com/Lj36duE.gif',
        },
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
        .setLabel('Play Now')
        .setCustomId('play_now')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      const sentMessage = await welcomeChannel.send({ embeds: [introductionEmbed], components: [row] });
      await sentMessage.pin();
    } else {
      console.log('Introduction message already pinned:', existingPinnedMessages.first().content);
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

client.on("ready", async (interaction) => {
  const guideChannelId = '1160364114502230092';
  const guideChannel = client.channels.cache.get(guideChannelId);

  if (!guideChannel) {
    console.error('Guide channel unable to be identified.');
    return;
  }

  try {
    // Check if the guide channel has a pinned message already.
    const existingMessages = await guideChannel.messages.fetch();

    if (existingMessages.size === 0) {
      const guideEmbed = {
        color: 0xFF0000,
        title: 'Commands',
        description: 'Check out these commands to get a better grasp of how to navigate this server.',
        thumbnail: {
          url: 'https://i.imgur.com/QrcYTuf.gif',
        },
        image: {
          url: 'https://i.imgur.com/Lj36duE.gif',
        },
        fields: [
          {
            name: '!b',
            value: 'Check your current balance.',
          },
          {
            name: '!tip <amount> <@user>',
            value: 'Send a tip to a fellow user of the server, funds will be withdrawn from your account.',
          },
          {
            name: 'Withdraw and Deposit',
            value: 'If you would like to withdraw or deposit from your account, please head to <#1160364114502230094> and click on the Play Now button.',
          }
        ]
      };

      await guideChannel.send({ embeds: [guideEmbed] });
    } else {
      console.log('Guide channel already populated.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});


//rules channel message embed
client.on("ready", async() => {
  const rulesChannelId = '1160364114502230090';

  const rulesChannel = client.channels.cache.get(rulesChannelId);

  if(!rulesChannel) {
    console.error('Rules channel not found.');
    return;
  }
  try {
    //Check if this channel has pinned messages already.
    const existingMessages = await rulesChannel.messages.fetch();

    if(existingMessages.size === 0) {
      const rulesEmbed = {
        color: 0xFF0000,
        title: 'Server Rules',
        description: 'Please read and follow these rules to ensure a great experience on our server.',
        thumbnail: {
          url: 'https://i.imgur.com/QrcYTuf.gif',
        },
        image: {
          url: 'https://i.imgur.com/Lj36duE.gif',
        },
        fields: [
          {
            name: 'Terms of Service',
            value: `Please read and follow these rules to ensure a great experience on our server.
            -> Welcome to the DeathmatchesGG server! We're glad you're here, and we want you to have a great time. To keep things safe and enjoyable for everyone, by using our services you agree to the following:`
          },
          {
            name: 'Rule 1',
            value: 'Be respectful to others and refrain from using harmful or inappropraite language.',
          },
          {
            name: 'Rule 2',
            value: 'Refrain from posting malicious content, including viruses and scams..',
          },
          {
            name: 'Rule 3',
            value: 'Treat everyone with kindness and be a positive member of the community.',
          },
          {
            name: 'Rule 4',
            value: 'Do not spam or send unnecessary pings.',
          },
          {
            name: 'Rule 5',
            value: 'This server is only for adults 18 and up.',
          },
          {
            name: 'Rule 6',
            value: `This server's currency is not real money and cannot be redeemed for cash or other items of real-world value.`
          },
          {
            name: 'Rule 7',
            value: 'If you have any questions or concerns about the rules, please contact a moderator.',
          },
          {
            name: 'Rule 8',
            value: 'These rules may be updated or revised at any time.',
          },
          {
            name: 'Rule 9',
            value: 'We appreciate your cooperation in helping us maintain a safe and welcoming evnironemnt for everyone.',
          },
          {
            name: 'Rule 10',
            value: 'No RWTing or chatting about RWT. Old School Runescape Gold has no value. Currency used on this server has no real value and is simply for fun.',
          },
          {
            name: 'Rule 11',
            value: `To ensure a safe, welcoming environment for all users, ALL users must adhere to Discord's Terms of Service and Guidelines. This includes refraining from discriminatory, offensive, or sexually explicit content, and treating all users with respect.`,
          },
          {
            name: '',
            value: 'Have fun and enjoy your time here!',
          }
        ],
      };
      //send the message rules.
      await rulesChannel.send({ embeds: [rulesEmbed] });
    } else {
      console.log('Rule channel already populated.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});//end of rules embed message.

//pvp-dm channel embed.
client.on("ready", async () => {
  const channelId = '1162842938661937222'; // Replace with your channel ID.
  const pvpChannel = client.channels.cache.get(channelId);

  if (!pvpChannel) {
    console.error('Channel not found.');
    return;
  }

  try {
    const existingPinnedMessages = await pvpChannel.messages.fetchPinned();

    if (existingPinnedMessages.size === 0) {
      // Create an embed for the introduction message.
      const introductionEmbed = {
        color: 0x0099FF,
        title: 'Welcome to PvP Deathmatches!',
        description: 'Click the button to create a match:',
        thumbnail: {
          url: 'https://i.imgur.com/QrcYTuf.gif',
        },
        image: {
          url: 'https://i.imgur.com/Lj36duE.gif',
        },
      };

      // Create a button for creating a match
      const button = new ButtonBuilder()
        .setLabel('Create Match')
        .setCustomId('pvpDMStart')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      // Send the pinned message.
      const sentMessage = await pvpChannel.send({ embeds: [introductionEmbed], components: [row] });
      await sentMessage.pin();
    } else {
      console.log('Introduction message already pinned:', existingPinnedMessages.first().content);
    }
  } catch (error) {
    console.error('Error:', error);
  }
});//end of pvp message.

//function to update user's balance.
async function updateUserBalance(userId, newBalance) {
  const query = 'UPDATE users SET balance_amount = ? WHERE user_id = ?';

  return new Promise((resolve, reject) => {
    connection.query(query, [newBalance, userId], (error, results) => {
      if(error) {
        console.error('Error updating user balance:', error);
        reject(error);
      } else {
        console.log(`User ${userId} balance updated to ${newBalance}`);
        resolve();
      }
    })
  })
}

//function to retrieve user's balance.
async function queryUserBalance(userId) {
  const query = 'SELECT balance_amount FROM users WHERE user_id = ?';

  return new Promise((resolve, reject) => {
    connection.query(query, [userId], (error, results) => {
      if (error) {
        console.error('Error querying the database:', error);
        reject(error);
      } else {
        if (results.length > 0) {
          resolve(results[0].balance_amount);
        } else {
          resolve(0); // User not found in the database
        }
      }
    });
  });
}


//fairness channel message embed.
client.on("ready", async() => {
  const fairnessChannelId = '1160364114502230093';

  const fairnessChannel = client.channels.cache.get(fairnessChannelId);

  if(!fairnessChannel) {
    console.error('Rules channel not found.');
    return;
  }
  try {
    //Check if the channel has pinned messages already.
    const existingMessages = await fairnessChannel.messages.fetch();

    if(existingMessages.size === 0) {
      const fairnessEmbed = {
        color: 0xFF0000,
        title: 'Fairness',
        description: 'We play fair here at DeathmatchGG, we will prove it here.',
        thumbnail: {
          url: 'https://i.imgur.com/QrcYTuf.gif',
        },
        image: {
          url: 'https://i.imgur.com/Lj36duE.gif',
        },
        fields: [
          {
            name: 'House',
            value: 'Check the link here to see some of the code and how our game works on the backend.',
          },
          {
            name: 'Dicing',
            value: 'Check the link here to see our Dicing game:'
          },
          {
            name: 'Others',
            value: 'Placeholder for the games and fairness.'
          },
        ],
      };
      //send the embed.
      await fairnessChannel.send({ embeds: [fairnessEmbed] });
    } else {
      console.log('Fairness channel already populated.');
    }
  } catch (error) {
      console.error('Error:', error);
  }
});//end of fairness embed.


//Creating a channel with the user and bot if the user clicks the 'play_now' button.
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'play_now') {
    if (!interaction.guild) {
      return interaction.reply('This command can only be done within the server.');
    }

    const user = interaction.user;
    const botId = client.user.id;
    const everyoneRole = interaction.guild.roles.everyone;
    const channelName = `${user.username}'s Personal Channel.`;

    // Create the private channel with permission overwrites.
    const personalThread = await interaction.guild.channels.create({
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
        {
          
            id: interaction.guild.roles.everyone,
            deny: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
        },
      ],
    });
    // Console logging an error.
    console.log('Created channel:', personalThread);

    // Create an introduction embed.
    const introductionEmbed = {
      color: 0x0099FF,
      title: `Welcome to your private channel, ${user.username}!`,
      description: 'You can click one of the buttons below to play:',
      thumbnail: {
        url: 'https://i.imgur.com/QrcYTuf.gif',
      },
      image: {
        url: 'https://i.imgur.com/Lj36duE.gif',
      }
    };

    // Send the introduction embed.
    personalThread.send({ embeds: [introductionEmbed] });

    //Buttons that go on the first row of the introduction message.
    const depositButton = new ButtonBuilder()
      .setLabel('Deposit')
      .setCustomId('deposit_button')
      .setStyle(ButtonStyle.Primary);

    const withdrawButton = new ButtonBuilder()
      .setLabel('Withdraw')
      .setCustomId('withdraw_button')
      .setStyle(ButtonStyle.Danger);

    const gamesButton = new ButtonBuilder()
      .setLabel('Games')
      .setCustomId('games_button')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(depositButton, withdrawButton, gamesButton);
    personalThread.send({ components: [row] });
  }
});


//on interaction for the games button.
client.on("interactionCreate", async (interaction) => {
  if(!interaction.isButton()) return;

  if(interaction.customId === 'games_button') {
    if(!interaction.guild) {
      return interaction.reply('This command can only be done within a server.');
    }
    const user = interaction.user;

    //Prompt the user with a reply of buttons in action row builder.
    const dicingButton = new ButtonBuilder()
    .setLabel('Dicing')
    .setCustomId('dicing_button')
    .setStyle(ButtonStyle.Primary);
  
  const deathmatchButton = new ButtonBuilder()
    .setLabel('New Deathmatch')
    .setCustomId('new_deathmatch_button')
    .setStyle(ButtonStyle.Primary)

  const houseButton = new ButtonBuilder()
      .setLabel('Play House')
      .setCustomId('play_house')
      .setStyle(ButtonStyle.Primary);
  const blackjackButton = new ButtonBuilder()
    .setLabel('Blackjack')
    .setCustomId('blackjack_button')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(houseButton, dicingButton, deathmatchButton);
  //respond with the buttons.
  await interaction.reply({ content: '', components: [row] });
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

//Creating a ticket for the user.
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  if (interaction.isModalSubmit() && interaction.customId === 'deposit_modal') {
    const user = interaction.user;
    const adminRoleName = 'Admin'; // Replace with the name of your Admin role.
    const channelName = 'Ticket Channel';

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
        {
          id: interaction.guild.roles.everyone,
          deny: [
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


//admin command !add.
client.on("messageCreate", (message) => {
  if(message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'add' && isAdmin(message.member)) {
    const amount = parseFloat([args[0]]);
    const targetUser = message.mentions.users.first();

    if (isNaN(amount) || !targetUser) {
      return message.reply('Invalid command usage, Use `!add <amount> <@user>`');
    }
    //SQL statement.
    const sql = 'UPDATE users SET balance_amount = balance_amount + ? WHERE user_id = ?';

    connection.query(sql, [amount, targetUser.id], (err, results) => {
      if(err) {
        console.error('Error updating balance:', err);
        return message.reply('An error occurred while updating the balance.');
      }

      if (results.affectedRows > 0) {
        message.reply(`Added ${amount} to ${targetUser.username}'s balance.`);
      } else {
        message.reply('User not found or an error occurred.');
      }
    });
  }
});

//function to check if a user is an admin.
function isAdmin(member) {
  return member.permissions.has(PermissionsBitField.Flags.Administrator);
}

// Command to check user's own stats
client.on("messageCreate", async (message) => {
  if (message.content === `${prefix}stats`) {
    const userId = message.author.id;
    const userStats = await getUserStats(userId);

    if (userStats) {
      const embedStats = {
        color: 0x0099FF,
        title: `${message.author.username}'s Stats`,
        thumbnail: {
          url: 'https://i.imgur.com/QrcYTuf.gif',
        },
        image: {
          url: 'https://i.imgur.com/Lj36duE.gif',
        },
        fields: [
          {
            name: 'Wins',
            value: userStats.wins,
          },
          {
            name: 'Losses',
            value: userStats.losses,
          },
          {
            name: 'Total Winnings',
            value: userStats.total_winnings,
          },
          {
            name: 'Win Streak',
            value: userStats.win_streak,
          },
          {
            name: 'Loss Streak',
            value: userStats.loss_streak,
          },
        ]
      };

      // Send the embed as a reply
      message.reply({ embeds: [embedStats] });
    } else {
      message.reply("User not found in the stats database.");
    }
  }
});


function getUserStats(userId) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM user_stats WHERE user_id = ?';
    connection.query(query, [userId], (error, results)=> {
      if(error) {
        console.error('Error querying user stats:', error);
        reject(error);
      } else {
        if(results.length > 0) {
          //user stats found.
          const userStats = results[0];
          resolve(userStats);
        } else {
          //User not found in the database.
          resolve(null);
        }
      }
    })
  })
}//come back to work on this command please but for now it is what it is.

//start of message to go in the house channel.
client.on("ready", async() => {
  const embedHouse = {
    color: 0x0099FF,
    title: 'Play House now',
    description: 'Want to play against the house? Easy enough, click the button below this message to get started.',
    thumbnail: {
      url: 'https://i.imgur.com/QrcYTuf.gif',
    },
    image: {
      url: 'https://i.imgur.com/Lj36duE.gif',
    },
  };
  const houseButton = new ButtonBuilder()
    .setLabel('Play House now')
    .setCustomId('houseBtn')
    .setStyle(ButtonStyle.Primary);
  const channelId = '1160402136744603749';
  const channel = client.channels.cache.get(channelId);

  // Check if the message already exists in the channel
  const existingMessages = await channel.messages.fetch();
  const existingMessage = existingMessages.find((message) => message.embeds[0]?.title === 'Play House now');

  if (!existingMessage) {
    const row = new ActionRowBuilder().addComponents(houseButton);
    await channel.send ({ embeds: [embedHouse], components: [row] });
  }
});

//Buttons that go on the first row of the introduction message.
const depositButton = new ButtonBuilder()
  .setLabel('Deposit')
  .setCustomId('deposit_button')
  .setStyle(ButtonStyle.Primary);

const withdrawButton = new ButtonBuilder()
  .setLabel('Withdraw')
  .setCustomId('withdraw_button')
  .setStyle(ButtonStyle.Danger);

const houseButton = new ButtonBuilder()
  .setLabel('Play House')
  .setCustomId('house_initiation')
  .setStyle(ButtonStyle.Primary);

//Creating a channel with the user and bot if the user clicks the 'play_now' button.
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'houseBtn') {
    if (!interaction.guild) {
      return interaction.reply('This command can only be done within the server.');
    }

    const user = interaction.user;
    const botId = client.user.id;
    const everyoneRole = interaction.guild.roles.everyone;
    const channelName = `${user.username}'s Personal Channel.`;

    // Create the private channel with permission overwrites.
    const personalThread = await interaction.guild.channels.create({
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
        {
          
            id: interaction.guild.roles.everyone,
            deny: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
            ],
        },
      ],
    });
    // Console logging an error.
    console.log('Created channel:', personalThread);

    // Create an introduction embed.
    const introductionEmbed = {
      color: 0x0099FF,
      title: `Welcome to your private channel, ${user.username}!`,
      description: 'You can click one of the buttons below to play:',
      thumbnail: {
        url: 'https://i.imgur.com/QrcYTuf.gif',
      },
      image: {
        url: 'https://i.imgur.com/Lj36duE.gif',
      },
    };

    // Send the introduction embed.
    personalThread.send({ embeds: [introductionEmbed] });
    const row = new ActionRowBuilder().addComponents(depositButton, withdrawButton, houseButton);
    personalThread.send({ components: [row] });
  }
});

// Inside your 'interactionCreate' event listener
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'house_initiation') {
    if (!interaction.guild) {
      return interaction.reply('This command can only be done within the server.');
    }

    const user = interaction.user;

    // Prompt the user to enter the bet amount
    const modal = new ModalBuilder()
      .setCustomId('house_amount_modal')
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
  //if(!interaction.isModalSubmit()) return;
  if(interaction.isModalSubmit() && interaction.customId === 'house_amount_modal') {
    const userId = interaction.user.id;
    const betAmount = interaction.fields.getTextInputValue('bet_amount');
    if(!isNaN(betAmount) && betAmount > 0) {
      //bet amount is valid.
      console.log(`User enter a valid bet amount: ${betAmount}.`);
      playHouseGame(userId, betAmount, interaction);
    } else {
      //invalid bet amount.
      await interaction.reply('Please enter a valid positive number.')
    }
  }
});

//game function section.
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

                    const lossEmbed = {
                      color: 0xFF0000,
                      title: 'Better luck next time!',
                      description: `You lost ${userLoss} credits.`,
                      thumbnail: {
                        url: 'https://i.imgur.com/QrcYTuf.gif',
                      },
                      image: {
                        url: 'https://i.imgur.com/Lj36duE.gif',
                      },
                      fields: [
                        {
                          name: 'Updated Balance',
                          value: `Your updated balance is now ${updatedBalance} gold.`,
                        },
                        // Action buttons will be added here.
                      ],
                    };

                    // Placeholder for the buttons, which should be added here.
              const playAgain = new ButtonBuilder()
                .setLabel('Play Again')
                .setCustomId('play_again')
                .setStyle(ButtonStyle.Primary);
              const withdrawBtn = new ButtonBuilder()
                .setLabel('Withdraw')
                .setCustomId('withdraw')
                .setStyle(ButtonStyle.Danger);
              const depositBtn = new ButtonBuilder()
                .setLabel('Deposit')
                .setCustomId('deposit')
                .setStyle(ButtonStyle.Primary);
              const row = new ActionRowBuilder().addComponents(houseButton, withdrawButton, depositButton);
                interaction.reply({ embeds: [lossEmbed], components: [row] });
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
          // Fetch the user's updated balance.
          connection.query(
            'SELECT balance_amount FROM users WHERE user_id = ?',
            [userId],
            (fetchErr, fetchResult) => {
              if (fetchErr) {
                console.error('Error fetching user balance: ' + fetchErr.message);
                return;
              }
              const updatedBalance = fetchResult[0]?.balance_amount || 0;

              const winEmbed = {
                color: 0x00FF00,
                title: 'Congratulations, you won!',
                description: `You won ${userWinnings} gold.`,
                thumbnail: {
                  url: 'https://i.imgur.com/QrcYTuf.gif',
                },
                image: {
                  url: 'https://i.imgur.com/Lj36duE.gif',
                },
                fields: [
                  {
                    name: 'Updated Balance',
                    value: `Your updated balance is now ${updatedBalance} gold.`,
                  },
                ],
              };

              // Placeholder for the buttons, which should be added here.
              const playAgain = new ButtonBuilder()
                .setLabel('Play Again')
                .setCustomId('play_again')
                .setStyle(ButtonStyle.Primary);
              const withdrawBtn = new ButtonBuilder()
                .setLabel('Withdraw')
                .setCustomId('withdraw')
                .setStyle(ButtonStyle.Danger);
              const depositBtn = new ButtonBuilder()
                .setLabel('Deposit')
                .setCustomId('deposit')
                .setStyle(ButtonStyle.Primary);
              const row = new ActionRowBuilder().addComponents(houseButton, withdrawButton, depositButton);
              interaction.reply({ embeds: [winEmbed], components: [row] });
            }
          );
        } else {
          interaction.reply('User not found.');
        }
      }
    );
  }
}// End of playHouseGame().

//start of deathmatch.
function playDeathmatch(userId, betAmount, query) {
  // Generating a random number between 0 and 1.
  const randomBytes = crypto.randomBytes(1);
  const randomValue = randomBytes[0] / 255.0;


}

//handling logic and other attempt at deathmatch down here | starting with !dm command.
client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore bot messages.
  if (!message.content.startsWith(prefix)) return; // Check if the message starts with the prefix '!'.

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'dm') {
    // Ask for a number in a modal.
    const filter = (m) => m.author.id === message.author.id;
    const pvpInput = new TextInputBuilder()
      .setCustomId('PVPInput')
      .setLabel('PVP Deathmatch Wager')
      .setRequired(true)
      .setPlaceholder('Enter amount here...')
      .setStyle(TextInputStyle.Short);

    const row = new ActionRowBuilder().addComponents(pvpInput);

    const pvpModal = new ModalBuilder()
      .setCustomId('PVPModal')
      .setTitle('Enter the amount you wish to play with here.')
      .addComponents(row);

    await message.channel.send({ content: 'Please enter your bet amount:', components: [pvpModal] });
  }
});

//PVP DM Section.
const userBetAmounts = new Map();
const userRoles = new Map();
const pvpMatchPairs = new Map();
const userInitiations = new Map();
// Dealing with interactions from the PVPDMs channel.
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'pvpDMStart' && interaction.isButton()) {
      const userId = interaction.user.id;

      // Check if the user already set a bet amount.
      if (userRoles.has(userId)) {
        await interaction.reply('You have already started a match.');
        return;
      }
      userRoles.set(userId, 'Player 1'); // Mark the initiator as Player 1.
      console.log(userRoles);
      // Prompt the user to enter the bet amount.
      try {
        const betModal = new ModalBuilder()
          .setCustomId('betModal')
          .setTitle('Enter the amount you wish to play with.');
        const betAmountInput = new TextInputBuilder()
          .setCustomId('betAmountInput')
          .setLabel('Deathmatch Amount Input')
          .setPlaceholder('Enter amount here...')
          .setRequired(true)
          .setStyle(TextInputStyle.Short);

        const dmRow = new ActionRowBuilder().addComponents(betAmountInput);
        betModal.addComponents(dmRow);
        await interaction.showModal(betModal);
      } catch (error) {
        console.error('Error prompting for bet amount:', error);
      }
    }
})

//Handling the Modal submission.
client.on(Events.InteractionCreate, async (interaction) => {
  console.log(interaction);
  if (interaction.isModalSubmit() && interaction.customId === 'betModal') {
    console.log('Modal Submission:', interaction);
    try {
      const userId = interaction.user.id;
      const betAmount = parseFloat(interaction.fields.getTextInputValue('betAmountInput'));

      const userBalance = await queryUserBalance(userId);

      if (!isNaN(betAmount) && userBalance >= betAmount) {
        userInitiations.set(userId, { betAmount }); //Store user 1 and their information.
        // User has enough balance, proceed with code.
        userBetAmounts.set(userId, betAmount);
        //logging the userBetAmounts to my console.
        console.log(userBetAmounts);
        const matchEmbed = {
          color: 0x0099FF,
          title: 'PVP Deathmatch Offer',
          description: `User: ${interaction.user.tag}\nBet Amount: ${betAmount}`,
          thumbnail: {
            url: 'https://i.imgur.com/QrcYTuf.gif',
          },
          image: {
            url: 'https://i.imgur.com/Lj36duE.gif',
          },
        };
        const acceptButton = new ButtonBuilder()
          .setLabel('Accept Match')
          .setCustomId('acceptButton')
          .setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(acceptButton);

        await interaction.channel.send({ embeds: [matchEmbed], components: [row] });
      } else {
        await interaction.reply('Insufficient balance. Please enter a valid amount based upon your balance.');
      } 
    } catch (error) {
      console.error('Error handling bet amount submission:', error);
    }
  }
})

// Now handling the user clicking the acceptButton (id).
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isButton() && interaction.customId === 'acceptButton') {
      const user2id = interaction.user.id;
      const user1Info = [...userInitiations.entries()].find(([, value]) => value.userId !== user2id);
      console.log(user1Info);
      if (user1Info) {
        const user1id = user1Info[1].userId;
        const user1BetAmount = user1Info[1].betAmount;
        const user2BetAmount = user1BetAmount;

        const user1Balance = await queryUserBalance(user1id);
        const user2Balance = await queryUserBalance(user2id);

        if (user2Balance >= user2BetAmount && user1Balance >= user1BetAmount) {
          //Proceed to create a text channel for the two users.
          const guild = interaction.guild;
          const channel = await guild.channels.create({
            name: 'PVP DM Match',
            type: ChannelType.GuildText,
            permissionOverwrites: [
              {
                id: user1id,
                allow: [
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ViewChannel,
                ],
              },
              {
                id: user2id,
                allow: [
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ViewChannel,
                ],
              },
              {
                id: interaction.guild.roles.everyone,
                deny: [
                  PermissionsBitField.Flags.SendMessages,
                  PermissionsBitField.Flags.ViewChannel,
                ],
              },
            ],
          });
          const embed = {
            color: 0x0099FF,
            title: 'PVP Deathmatch Initiation',
            description: 'The match is ready to be started. Click "Start Match" to begin.',
            thumbnail: {
              url: 'https://i.imgur.com/QrcYTuf.gif',
            },
            image: {
              url: 'https://i.imgur.com/Lj36duE.gif',
            },
          };

          const button = new ButtonBuilder()
            .setLabel('Start Match')
            .setCustomId('startMatchButton')
            .setStyle(ButtonStyle.Danger);

          const row = new ActionRowBuilder().addComponents(button);
          await channel.send({ embeds: [embed], components: [row] });
        }
      }
    }
  } catch (error) {
    console.error('Error handling Accept Button interaction:', error);
  }
});

//login to the client with the bot.
const botToken = process.env.TOKEN;
client.login(botToken);