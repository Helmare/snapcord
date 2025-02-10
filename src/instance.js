import { neon } from '@neondatabase/serverless';
import pino from 'pino';

const logger = pino();

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
    logger.info(
      `fetched ${results.length} instance${results.length == 1 ? '' : 's'}`
    );

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

  /**
   * Gets an instance by channel id.
   * @param {string} channelId
   * @return {Promise<Instance>}
   */
  async getByChannelId(channelId) {
    const results = await this
      .sql`SELECT * FROM instances WHERE channel_id=${channelId};`;

    if (results.length === 0) {
      return undefined;
    } else {
      return results[0];
    }
  }

  /**
   * Creates a new instance by channel id.
   * @param {string} channelId
   * @param {number} maxMessageAge
   * @return {Promise<Instance|undefined>}
   */
  async create(channelId, maxMessageAge) {
    try {
      const results = await this
        .sql`INSERT INTO instances (channel_id, max_message_age) VALUES (${channelId}, ${maxMessageAge}) RETURNING *;`;
      logger.info(results[0], 'created new instance');
      return results[0];
    } catch (err) {
      logger.error(err, 'failed to create instance');
      return undefined;
    }
  }

  /**
   * Delete instance by id.
   * @param {number} id
   * @return {Promise<boolean>}
   */
  async delete(id) {
    try {
      await this.sql`DELETE FROM instances WHERE id=${id};`;
      this.instances = this.instances.filter((i) => i.id != id);
      logger.info(`deleted instance ${id}`);
      return true;
    } catch (err) {
      logger.error(err, 'failed to delete instance');
      return false;
    }
  }
}
