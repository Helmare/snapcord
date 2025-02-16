import './config.js';
import { Client, GatewayIntentBits } from 'discord.js';
import pino from 'pino';
import instances from './model/instances.js';
import { useCommands } from './commands/index.js';
import { useWorker } from './worker.js';

const logger = pino();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Fetch database.
if (!(await instances.fetch())) {
  process.exit(1);
}

client.on('ready', async () => {
  await useCommands(client);
  useWorker(client);

  logger.info(`${client.user.tag} is online!`);
});
client.login(process.env.DISCORD_CLIENT_TOKEN);
