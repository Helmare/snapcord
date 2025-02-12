import { neon } from '@neondatabase/serverless';
import pino from 'pino';

const logger = pino();
const sql = neon(process.env.DATABASE_URL);

class InstanceModel {
  constructor() {
    /** @type {Instance[]} */
    this.cache = [];
  }

  /**
   * Fetches the results and sets the cache.
   * @returns {Instance[]}
   */
  async fetch() {
    try {
      const results = await sql`SELECT * FROM instances;`;
      this.cache.splice(0, this.cache.length, ...results);

      logger.info({ count: results.length }, 'fetched instances');
      return results;
    } catch (err) {
      logger.error('failed to fetch instances');
    }
  }

  /**
   * Finds an instance by ID in the cache.
   * @param {number} id
   * @param {Instance|undefined}
   */
  find(id) {
    return this.cache.find((i) => i.id == id);
  }
  /**
   * Finds an instance by channel id in the cache.
   * @param {string} channelId
   * @return {Instance|undefined}
   */
  findByChannelId(channelId) {
    return this.cache.find((i) => i.channel_id == channelId);
  }

  /**
   * Creates a new instance by channel id.
   * @param {string} channelId
   * @param {number} maxMessageAge
   * @return {Promise<Instance|undefined>}
   */
  async create(channelId, maxMessageAge) {
    try {
      const results =
        await sql`INSERT INTO instances (channel_id, max_message_age) VALUES (${channelId}, ${maxMessageAge}) RETURNING *;`;
      this.cache.push(...results);

      logger.info(results[0], 'created new instance');
      return results;
    } catch (err) {
      logger.error(err, 'failed to create instance');
      return undefined;
    }
  }
  /**
   * Updates an instance in the database.
   * @param {Instance} instance
   * @returns {Promise<void>}
   */
  async save(instance) {
    try {
      await sql`UPDATE instances SET max_message_age=${instance.max_message_age} WHERE id=${instance.id};`;
      logger.info({ id: instance.id }, 'updated instance');
    } catch (err) {
      logger.error(err, 'failed to update instance');
    }
  }
  /**
   * Delete instance by id.
   * @param {number} id
   * @return {Promise<boolean>}
   */
  async delete(id) {
    try {
      await sql`DELETE FROM instances WHERE id=${id};`;
      this.cache.splice(
        0,
        this.cache.length,
        ...this.cache.filter((item) => item.id !== id)
      );

      logger.info({ id }, 'deleted instance');
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
