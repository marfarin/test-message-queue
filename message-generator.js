const init = require('./lib/utils/init');
const { RabbitConnection } = require('./lib/connections');
const { messageGenerator, userGenerator, groupGenerator } = require('./lib/generator');
const { assertExchanges, assertQueues, bindExchangesToQueues } = require('./lib/amqp-asserts');

const config = init(`${__dirname}/config/config.yaml`);

const run = async () => {
  const sendPayloads = messageGenerator(
    config.generator,
    userGenerator(config.generator),
    groupGenerator(config.generator),
  );
  const rabbitConnection = await RabbitConnection(config.rabbit);
  const { amqpChannel } = rabbitConnection;

  await assertExchanges(amqpChannel);
  await assertQueues(amqpChannel, config.limitations);
  await bindExchangesToQueues(amqpChannel);

  const queue = 'message';

  sendPayloads.forEach((value) => {
    const msg = JSON.stringify(value);
    const result = amqpChannel.sendToQueue(queue, Buffer.from(msg));
    console.log(' [x] Sent %s', msg, result);
    return result;
  });
  return rabbitConnection;
};

run()
  /* .then(async (rabbitConnection) => {
    await rabbitConnection.amqpChannel.close();
    await rabbitConnection.amqpConnection.close();
    return true;
  }) */
  .catch((err) => { throw err; });
