import { neon } from '@neondatabase/serverless';
import pino from 'pino';

const logger = pino();

/**
 * @extends {Array<Instance>}
 */
class InstanceModel extends Array {
  /**
   * @param {string?} databaseUrl
   * @param {Instance[]} items
   */
  constructor(databaseUrl, items = []) {
    super(items);
    this.sql = neon(databaseUrl || process.env.DATABASE_URL);
  }

  /**
   * Clears then fetches from the database.
   */
  async fetch() {
    try {
      const results = await this.sql`SELECT * FROM instances;`;

      this.length = 0;
      this.push(...results);

      logger.info({ count: results.length }, 'fetched instances');
    } catch (err) {
      logger.error('failed to fetch instances');
    }
  }

  /**
   * Gets an instance by channel id.
   * @param {string} channelId
   * @return {Promise<Instance>}
   */
  findByChannelId(channelId) {
    return this.find((i) => i.channel_id == channelId);
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
      this.push(...results);

      logger.info(results[0], 'created new instance');
      return results;
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
      const results = await this.sql`DELETE FROM instances WHERE id=${id};`;
      this.splice(0, this.length, ...this.filter((item) => item.id !== id));
      logger.info({ id }, 'Deleted instance');
      return true;
    } catch (err) {
      logger.error(err, 'failed to delete instance');
      return false;
    }
  }
}
export default new InstanceModel();

/**
 * @typedef {object} Instance
 * @prop {number} id
 * @prop {string} channel_id
 * @prop {number} max_message_age
 * @prop {Date} created_at
 */
