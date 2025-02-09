import {
  Client,
  IntentsBitField,
  Message,
  SlashCommandBuilder,
} from 'discord.js';

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

client.on('ready', async () => {
  console.log(`${client.user.tag} is online 🎉`);

  const channel = await client.channels.fetch(process.env.DEV_CHANNEL_ID);
  setInterval(async () => {
    const cutoff = Date.now() - process.env.MESSAGE_MAX_AGE;

    /** @type {Message[]} */
    const messages = await channel.messages.fetch({ limit: 100 });
    messages.forEach(async (message) => {
      // Ignore messages whether the auther is this bot.
      if (message.author.id == process.env.DISCORD_CLIENT_ID) return;

      // Ignore messages with the :floppy_disk: reaction.
      if (await _hasReaction(message, '💾')) return;

      // Ignore messages that are young.
      if (message.createdTimestamp > cutoff) return;

      // Delete the rest of the messages.
      message
        .delete()
        .then(() => console.log(`Deleted message {${message.id}}`))
        .catch((e) => {
          if (e.status != 404) console.log(e);
        });
    });
  }, process.env.APP_INTERVAL);
});
/**
 * Gets whether or not a message has a reaction.
 *
 * @param {Message} message
 * @param {string} key
 * @return {Promise<boolean>}
 */
async function _hasReaction(message, key) {
  const reaction = message.reactions.cache.get(key);
  try {
    return reaction && (await reaction.users.fetch()).size > 0;
  } catch (e) {
    return false;
  }
}

client.login(process.env.DISCORD_CLIENT_TOKEN);
