import { SlashCommandBuilder, ChannelType } from 'discord.js';
import pino from 'pino';
import instances from '../model/instances.js';

const logger = pino();

/**
 * @type {import('./types').Command}
 */
export default {
  builder: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Replies with Snapcord status in a channel.')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Which channel to view status (this on by default).')
        .addChannelTypes([ChannelType.GuildText])
        .setRequired(false)
    ),
  async execute(interaction) {
    // Setup
    /** @type {import('discord.js').TextChannel */
    const channel = interaction.options.getChannel('channel');
    const channelId = channel?.id || interaction.channelId;
    const name = channel ? `<#${channel.id}>` : 'this channel';
    logger.info({ channelId: channelId }, 'status for channel');

    const instance = instances.findByChannelId(channelId);
    let reply = `I'm not enabled in ${name} 🥺`;
    if (instance) {
      const hours = instance.max_message_age / (60 * 60 * 1000);
      reply = `I'm enabled in ${name} 😊 Messages will last ${hours} hour${
        hours == 1 ? '' : 's'
      } and reacting with 💾 will save them.`;
    }
    await interaction.reply(reply);
  },
};
