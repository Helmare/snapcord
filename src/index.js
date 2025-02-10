import { Client, GatewayIntentBits } from 'discord.js';
import { InstanceRepository } from './instance.js';
import { useCommands } from './bot/commands.js';
import pino from 'pino';

import dotenv from 'dotenv';
dotenv.config();

const logger = pino();
const repo = new InstanceRepository(process.env.DATABASE_URL);
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

useCommands(client, repo);

client.on('ready', async () => {
  logger.info(`${client.user.tag} is online`);
  setInterval(async () => {
    const instances = await repo.fetch();
    const startTime = Date.now();

    for (const instance of instances) {
      logger.info(instance, 'running instance');
      const channel = await _getChannelFromInstance(instance);
      if (!channel) break;

      const messages = await channel.messages.fetch({ limit: 100 });
      logger.info({ count: messages.size }, 'fetched messages');
      const cutoff = Date.now() - instance.max_message_age;

      for (const [id, message] of messages) {
        // Ignore messages with the :floppy_disk: reaction.
        if (await _hasReaction(message, '💾')) break;

        // Ignore messages that are young.
        if (message.createdTimestamp > cutoff) break;

        // Delete the rest of the messages.
        try {
          await message.delete();
          logger.info({ id: message.id }, 'deleted message');
        } catch (err) {
          if (err.status == 404) {
            logger.warn(err);
          } else {
            logger.error(err);
          }
        }
      }
    }

    logger.info({ duration: Date.now() - startTime }, 'completed run');
  }, 10000);
});
/**
 * Gets a channel or undefined if something went wrong.
 * @param {import('./instance.js').Instance} instance
 * @returns {Promise<import('discord.js').TextChannel|null|undefined>}
 */
async function _getChannelFromInstance(instance) {
  try {
    const channel = await client.channels.fetch(instance.channel_id);
    if (!channel.isTextBased()) {
      logger.error('instance was running on non-text channel');
      await repo.delete(instance.id);
      return undefined;
    }
    return channel;
  } catch (err) {
    logger.error(err, 'failed to fetch channel');
    await repo.delete(instance.id);
    return undefined;
  }
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
