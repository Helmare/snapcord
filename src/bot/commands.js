import {
  ChannelType,
  SlashCommandBuilder,
  TextChannel,
  PermissionFlagsBits,
} from 'discord.js';
import { InstanceRepository } from '../instance.js';
import pino from 'pino';

const logger = pino();

/**
 * Installs the commands on the client.
 * @param {import('discord.js').Client} client
 * @param {InstanceRepository} repo
 */
export async function useCommands(client, repo) {
  // Setup
  client.on('ready', async () => {
    await client.application.commands.set([
      new SlashCommandBuilder()
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
      new SlashCommandBuilder()
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
    ]);
    logger.info('registered commands');
  });

  // Parse interactions.
  client.on('interactionCreate', async (interaction) => {
    if (interaction.commandName === 'enable') {
      _turnOn(interaction, repo);
    } else if (interaction.commandName == 'disable') {
      _turnOff(interaction, repo);
    } else {
      logger.warn(
        { commandName: interaction.commandName },
        'unrecognized command'
      );
    }
  });
}
/**
 * @param {import('discord.js').Interaction} interaction
 * @param {InstanceRepository} repo
 */
async function _turnOn(interaction, repo) {
  /** @type {TextChannel} */
  const channel = interaction.options.getChannel('channel');
  /** @type {string} */
  const channelId = channel?.id || interaction.channelId;
  const name = channel ? `<#${channel.id}>` : 'this channel';

  logger.info({ channelId: channelId }, 'enabling for channel');
  const instance = await repo.getByChannelId(channelId);
  if (instance) {
    logger.warn({ channelId: channelId }, 'instance exists for channel');
    await interaction.reply(`I'm still in ${name} 😎`);
  } else {
    const duration = interaction.options.getInteger('duration');
    await repo.create(channelId, duration);
    await interaction.reply(
      `I'm here in ${name} 😊 Messages will be deleted after ${
        duration / (60 * 60 * 1000)
      } hours. Save messages by reacting with 💾`
    );
  }
}
/**
 * @param {import('discord.js').Interaction} interaction
 * @param {InstanceRepository} repo
 */
async function _turnOff(interaction, repo) {
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
}
