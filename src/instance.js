import { neon } from '@neondatabase/serverless';

/**
 * @typedef {object} Instance
 * @prop {number} id
 * @prop {string} channel_id
 * @prop {number} max_message_age
 * @prop {Date} created_at
 */

export class InstanceRepository {
  constructor(databaseUrl) {
    this.sql = neon(databaseUrl);
    /** @type {Instance[]} */
    this.instances = [];
  }

  /**
   * Fetches all the instances saved to the database.
   * @returns {Promise<Instance[]>}
   */
  async fetch() {
    const results = await this.sql`SELECT * FROM instances;`;
    this.instances = results;
    return results;
  }
  /**
   * Gets all the instances either from the cache or fetching.
   * @returns {Promise<Instance[]>}
   */
  async all() {
    if (this.instances.length === 0) await this.fetch();
    return this.instances;
  }
}
