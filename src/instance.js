import { neon } from '@neondatabase/serverless';

/**
 * @typedef {object} Instance
 * @prop {number} id
 * @prop {string} channel_id
 * @prop {number} max_message_age
 * @prop {Date} created_at
 */

export class InstanceDB {
  constructor() {
    this.sql = neon(process.env.DATABASE_URL);
  }

  /**
   * Creates and saves an instance to the database.
   * @param {number} channelId
   */
  async create(channelId) {}
  /**
   * Fetches all the instances saved to the database.
   * @returns {Promise<Instance[]>}
   */
  async fetch() {
    const results = await this.sql`SELECT * FROM instances;`;
    return results;
  }
}
