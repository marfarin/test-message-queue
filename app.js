const { RabbitConnection, RedisConnection } = require('./lib/connections');
const init = require('./lib/utils/init');
const exit = require('./lib/utils/exit');
const { assertExchanges, assertQueues, bindExchangesToQueues } = require('./lib/amqp-asserts');
const messageConsumer = require('./lib/rabbit-message-consumer');

const config = init(`${__dirname}/config/config.yaml`);

const connections = {
  rabbitConnection: undefined,
  redisConnection: undefined,
};

process.on('warning', e => console.warn(e.stack));

const run = async () => {
  connections.redisConnection = RedisConnection(config.redis);
  connections.rabbitConnection = await RabbitConnection(config.rabbit);
  const { amqpChannel } = connections.rabbitConnection;
  amqpChannel.prefetch(1);
  messageConsumer(amqpChannel, connections.redisConnection, config.limitations);

  await assertExchanges(amqpChannel);
  await assertQueues(amqpChannel, config.limitations);
  await bindExchangesToQueues(amqpChannel);

  return true;
};

run()
  .then(() => console.log('consumer started'))
  .catch((err) => {
    throw err;
  });

process.on('SIGTERM', exit(connections));
process.on('SIGINT', exit(connections));
