/**
 * @param {Object} data
 * @param {RabbitConnectionClass} data.rabbitConnection
 * @param {RedisConnectionClass} data.redisConnection
 */
const exitFunction = data => async () => {
  try {
    data.rabbitConnection.close();
    data.redisConnection.close();
    process.exitCode = 0;
  } catch (error) {
    process.exitCode = 1;
  }
};

module.exports = exitFunction;
