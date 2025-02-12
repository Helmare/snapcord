import pino from 'pino';
import instances from './model/instances.js';

const logger = pino();
const worker = { running: false };

/**
 * Installs the worker on the client (only use after ready).
 * @param {import('discord.js').Client} client
 */
export function useWorker(client) {
  _start(client);
  logger.info('registered worker');
  return worker;
}

/**
 * @param {import('discord.js').Client} client
 */
async function _start(client) {
  worker.running = true;
  while (worker.running) {
    await new Promise((res) => setTimeout(res, 10000)); // Sleep for 10s
    await _run(client);
  }
}
/**
 * @param {import('discord.js').Client} client
 */
async function _run(client) {
  const startTime = Date.now();
  const stats = {
    fetched: 0,
    deleted: 0,
    failed: 0,
  };
  for (const instance of instances.cache) {
    logger.info(instance, 'running instance');
    const channel = await _getChannelFromInstance(client, instance);
    if (!channel) break;

    const messages = await channel.messages.fetch({ limit: 100 });
    logger.info({ count: messages.size }, 'fetched messages');
    stats.fetched += messages.size;
    const cutoff = Date.now() - instance.max_message_age;

    for (const [id, message] of messages) {
      // Ignore messages that are young.
      if (message.createdTimestamp > cutoff) continue;

      // Ignore messages with the :floppy_disk: reaction.
      if (await _hasReaction(message, '💾')) continue;

      // Delete the rest of the messages.
      try {
        await message.delete();
        stats.deleted++;
        logger.info({ id: message.id }, 'deleted message');
      } catch (err) {
        if (err.status != 404) {
          stats.failed++;
          logger.error(err);
        }
      }
    }
  }

  logger.info(
    { duration: Date.now() - startTime, messages: stats },
    'completed run'
  );
}
/**
 * Gets a channel or undefined if something went wrong.
 * @param {import('discord.js').Client} client
 * @param {import('../model/instances').Instance} instance
 * @returns {Promise<import('discord.js').TextChannel|null|undefined>}
 */
async function _getChannelFromInstance(client, instance) {
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
    await instances.delete(instance.id);
    return undefined;
  }
}
/**
 * Gets whether or not a message has a reaction.
 * @param {import('discord.js').Message} message
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
