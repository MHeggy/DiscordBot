const { insertUserData, connection } = require('./database.js');
const { Client, GatewayIntentBits, Role } = require('discord.js');
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,            // To receive information about the guilds (servers)
    GatewayIntentBits.GuildMessages,      // To receive messages sent in guilds
    GatewayIntentBits.GuildMembers,       // To receive information about members in the guild.
    GatewayIntentBits.MessageContent,     // To receive information about the message content sent in chats.
    // Add other intents as needed
  ]
});

//setting up roles for the server | starting with admin.
