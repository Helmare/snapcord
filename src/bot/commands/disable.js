import {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js';
import pino from 'pino';
import repo from '../../instance.js';

const logger = pino();

/**
 * @type {import('./types').Command}
 */
export default {
  builder: new SlashCommandBuilder()
    .setName('disable')
    .setDescription('Turns off snapcord in this channel.')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Which channel to enable (this one by default).')
        .addChannelTypes([ChannelType.GuildText])
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    /** @type {TextChannel} */
    const channel = interaction.options.getChannel('channel');
    /** @type {string} */
    const channelId = channel?.id || interaction.channelId;
    const name = channel ? `<#${channel.id}>` : 'this channel';

    logger.info({ channelId: channelId }, `disabling in channel`);
    const instance = await repo.getByChannelId(channelId);
    if (instance) {
      await repo.delete(instance.id);
      await interaction.reply(
        `I'm leaving ${name} 🥺 Messages will no longer be deleted.`
      );
    } else {
      await interaction.reply(`I'm not in ${name} 🤔`);
    }
  },
};
