import {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js';
import pino from 'pino';
import instances from '../model/instances.js';

const logger = pino();

/**
 * @type {import('./types').Command}
 */
export default {
  builder: new SlashCommandBuilder()
    .setName('enable')
    .setDescription('Turns on snapcord in this channel.')
    .addIntegerOption((option) =>
      option
        .setName('duration')
        .setDescription('Amount of time before a message is deleted.')
        .addChoices([
          { name: '24 hours', value: 24 * 60 * 60 * 1000 },
          { name: '12 hours', value: 12 * 60 * 60 * 1000 },
          { name: '6 hours', value: 6 * 60 * 60 * 1000 },
          { name: '4 hours', value: 4 * 60 * 60 * 1000 },
          { name: '2 hours', value: 2 * 60 * 60 * 1000 },
          { name: '1 hour', value: 1 * 60 * 60 * 1000 },
        ])
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Which channel to enable (this one by default).')
        .addChannelTypes([ChannelType.GuildText])
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  async execute(interaction) {
    // Setup
    /** @type {import('discord.js').TextChannel */
    const channel = interaction.options.getChannel('channel');
    const channelId = channel?.id || interaction.channelId;
    const name = channel ? `<#${channel.id}>` : 'this channel';
    logger.info({ channelId: channelId }, 'enabling for channel');

    // Find instance for the channel.
    const instance = await instances.findByChannelId(channelId);
    if (instance) {
      const duration = interaction.options.getInteger('duration');
      if (instance.max_message_age != duration) {
        // Update duration.
        instance.max_message_age = duration;
        await instances.save(instance);

        const hours = duration / (60 * 60 * 1000);
        await interaction.reply(
          `Messages will now be deleted after ${hours} hour${
            hours == 1 ? '' : 's'
          } in ${channel}.`
        );
      } else {
        // Already exists and same duration.
        logger.warn({ channelId: channelId }, 'instance exists for channel');
        await interaction.reply(`I'm still in ${name} 😎`);
      }
    } else {
      // Create new instance for channel.
      const duration = interaction.options.getInteger('duration');
      const hours = duration / (60 * 60 * 1000);
      await instances.create(channelId, duration);
      await interaction.reply(
        `I'm here in ${name} 😊 Messages will be deleted after ${hours} hour${
          hours == 1 ? '' : 's'
        }. Save messages by reacting with 💾`
      );
    }
  },
};
