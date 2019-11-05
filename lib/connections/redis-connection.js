const redis = require('redis');

const resolveCallback = (resolve, reject) => (err, res) => {
  if (err) {
    return reject(err);
  }
  return resolve(res);
};

/**
 * @param {Object} config
 * @param {RedisClient} redisInstance
 */
class RedisConnectionClass {
  constructor(config) {
    this.config = config;
  }

  /**
   * @returns {RedisClient}
   */
  init() {
    this.redisInstance = redis.createClient(this.config);
    return this.redisInstance;
  }

  /**
   * @param key
   * @returns {Promise<any>}
   */
  redisGet(key) {
    return new Promise((resolve, reject) => {
      this.redisInstance.get(key, resolveCallback(resolve, reject));
    });
  }

  /**
   * @param key
   * @param value
   * @param msTime
   * @returns {Promise<any>}
   */
  redisSet(key, value, msTime) {
    return new Promise((resolve, reject) => {
      this.redisInstance.set(key, value, 'PX', msTime, resolveCallback(resolve, reject));
    });
  }

  /**
   * @param key
   * @returns {Promise<any>}
   */
  redisIncr(key) {
    return new Promise((resolve, reject) => {
      this.redisInstance.incr(key, resolveCallback(resolve, reject));
    });
  }

  close() {
    this.redisInstance.quit();
  }
}

module.exports = (config) => {
  const RedisConnection = new RedisConnectionClass(config);
  RedisConnection.init();
  return RedisConnection;
};
