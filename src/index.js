import { Client, IntentsBitField } from 'discord.js';

import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', (client0) => {
  console.log(`${client0.user.tag} is online`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
