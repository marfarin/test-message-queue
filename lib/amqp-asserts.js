const exchangeNames = {
  SEND_MESSAGE: 'SEND_MESSAGE',
  TTL_MESSAGE: 'TTL-MESSAGE',
  DLX_MESSAGE: 'DLX-MESSAGE',
};

const assertExchanges = amqpChannel => Promise.all([]
  .concat(
    amqpChannel.assertExchange(exchangeNames.SEND_MESSAGE, 'fanout', { durable: true }),
  )
  .concat(amqpChannel.assertExchange(exchangeNames.TTL_MESSAGE, 'direct', { durable: true }))
  .concat(amqpChannel.assertExchange(exchangeNames.DLX_MESSAGE, 'fanout', { durable: true })));

const assertQueues = (amqpChannel, { userIntervalMs, groupIntervalMs }) => Promise.all([]
  .concat(amqpChannel.assertQueue('message', { durable: true }))
  .concat([
    amqpChannel.assertQueue('message-retry-user', { durable: true, deadLetterExchange: exchangeNames.DLX_MESSAGE, messageTtl: userIntervalMs }),
    amqpChannel.assertQueue('message-retry-group', { durable: true, deadLetterExchange: exchangeNames.DLX_MESSAGE, messageTtl: groupIntervalMs }),
  ]));

const bindExchangesToQueues = amqpChannel => Promise.all([]
  .concat(
    amqpChannel.bindQueue('message', exchangeNames.SEND_MESSAGE),
  )
  .concat(amqpChannel.bindQueue('message', exchangeNames.DLX_MESSAGE))
  .concat(
    amqpChannel.bindQueue('message-retry-user', exchangeNames.TTL_MESSAGE, 'retry-user'),
    amqpChannel.bindQueue('message-retry-group', exchangeNames.TTL_MESSAGE, 'retry-group'),
  ));

module.exports = { assertExchanges, assertQueues, bindExchangesToQueues };
