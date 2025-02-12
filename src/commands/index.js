import enable from './enable.js';
import disable from './disable.js';
import status from './status.js';
import pino from 'pino';

const logger = pino();

/**
 * Installs commands on the client (only use after ready).
 * @param {import('discord.js').Client} client
 */
export async function useCommands(client) {
  // Setup
  const commands = [enable, disable, status];
  await client.application.commands.set(commands.map((cmd) => cmd.builder));
  logger.info('registered commands');

  // Execute
  client.on('interactionCreate', async (interaction) => {
    let executed = false;
    for (let i = 0; i < commands.length; i++) {
      let command = commands[i];
      if (interaction.commandName == command.builder.name) {
        const result = await command.execute(interaction);
        if (result) {
          logger.warn(
            {
              commandName: command.builder.name,
              result: result,
              interactionId: interaction.id,
            },
            'command from interaction failed'
          );
        } else {
          logger.info(
            { commandName: command.builder.name },
            'successfully executed command'
          );
        }
        executed = true;
        break;
      }
    }
    if (!executed) {
      logger.warn(
        { commandName: interaction.commandName, id: interaction.id },
        'unknown command attempted'
      );
    }
  });
}
