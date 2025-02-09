import { Client, GatewayIntentBits } from 'discord.js';
import chalk from 'chalk';
import { InstanceDB } from './instance.js';

import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const db = new InstanceDB();
/** @type {import('./instance.js').Instance[]} */
let instances;

try {
  instances = await db.fetch();
} catch ({ message, code }) {
  console.error(chalk.redBright(`NEON -- ${message} [${code}]`));
  process.exit(1);
}

client.on('ready', async () => {
  _logTitle(`${client.user.tag} v${process.env.npm_package_version} is Online`);
  setInterval(async () => {
    const startTime = Date.now();
    const stats = {
      deletedMessages: 0,
      failedMessages: 0,
      instances: instances.length,
      time: 0,
    };

    for (const instance of instances) {
      /** @type {import('discord.js').TextChannel} */
      const channel = await client.channels.fetch(instance.channel_id);
      if (!channel.isTextBased()) break;

      const messages = await channel.messages.fetch({ limit: 100 });
      const cutoff = Date.now() - instance.max_message_age;

      for (const [id, message] of messages) {
        // Ignore messages whether the auther is this bot.
        if (message.author.id == process.env.DISCORD_CLIENT_ID) break;

        // Ignore messages with the :floppy_disk: reaction.
        if (await _hasReaction(message, '💾')) break;

        // Ignore messages that are young.
        if (message.createdTimestamp > cutoff) break;

        // Delete the rest of the messages.
        try {
          await message.delete();
          stats.deletedMessages++;
        } catch ({ code, status, message }) {
          console.error(
            chalk.redBright(`DISCORD -- ${status} ${message} [${code}]`)
          );
          stats.failedMessages++;
        }
      }
    }

    stats.time = Date.now() - startTime;
    console.log(stats);
  }, 10000);
});
/**
 * Logs the title with vertical and horizontal padding.
 * @param {string} text
 */
function _logTitle(text) {
  text = `  ${text}  `;
  let line = '';
  for (let i = 0; i < text.length; i++) {
    line += ' ';
  }

  console.log(chalk.bgHex('#5865F2')(`\n${line}\n${text}\n${line}\n`));
}
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
  } catch {
    return false;
  }
}

client.login(process.env.DISCORD_CLIENT_TOKEN);
