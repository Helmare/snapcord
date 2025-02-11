import enable from './enable.js';
import disable from './disable.js';
import pino from 'pino';

const logger = pino();

/**
 *
 * @param {import('discord.js').Client} client
 */
export async function useCommands(client) {
  const commands = [enable, disable];
  // Setup
  client.on('ready', async () => {
    await client.application.commands.set([
      commands[0].builder,
      commands[1].builder,
    ]);
    logger.info('registered commands');
  });
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
