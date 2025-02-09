import { SlashCommandBuilder } from 'discord.js';

/**
 * Installs the commands on the client.
 * @param {import('discord.js').Client} client
 */
export async function useCommands(client) {
  // Setup
  client.on('ready', async () => {
    await client.application.commands.set([
      new SlashCommandBuilder()
        .setName('snap')
        .setDescription('Enables or disables snapcord in this channel.'),
    ]);
  });

  // Parse interactions.
  client.on('interactionCreate', async (interaction) => {
    if (interaction.commandName === 'snap') {
      _executeSnap(interaction);
    }
  });
}
/**
 * @param {import('discord.js').Interaction} interaction
 */
async function _executeSnap(interaction) {
  await interaction.reply('I should probably do something...');
}
