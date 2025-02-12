/**
 * @typedef {object} Command
 * @prop {import('discord.js').SlashCommandBuilder} builder
 * @prop {(interaction: import('discord.js').Interaction) => Promise<number|undefined>} execute
 */
export { Command };
