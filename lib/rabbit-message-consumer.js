const fs = require('fs');

const queue = 'message';

const getAttemptAndUpdatedContent = (message, reasonOfFail, userLimit, groupLimit) => {
  let content = JSON.parse(message.content.toString());
  content.try_attempt = content.try_attempt + 1 || 1;
  let attempt = 'user';
  if (
    !reasonOfFail.userLimit
    && !reasonOfFail.groupLimit
    && userLimit < groupLimit
  ) {
    attempt = 'group';
  }
  if (!reasonOfFail.userLimit && reasonOfFail.groupLimit) {
    attempt = 'user';
  }
  if (reasonOfFail.userLimit && !reasonOfFail.groupLimit) {
    attempt = 'group';
  }
  content = Buffer.from(JSON.stringify(content));

  return { attempt, content };
};

function sendMsgToRetry(args, limitations) {
  const {
    amqpChannel: channel, msg, reasonOfFail,
  } = args;
  const { userLimit, groupLimit } = limitations;

  // ack original msg
  channel.ack(msg);
  // Unpack content, update and pack it back
  const { attempt, content } = getAttemptAndUpdatedContent(
    msg,
    reasonOfFail,
    userLimit,
    groupLimit,
  );
  const routingKey = `retry-${attempt}`;
  const options = {
    persistent: true,
  };

  Object.keys(msg.properties).forEach((key) => {
    options[key] = msg.properties[key];
  });

  return channel.publish('TTL-MESSAGE', routingKey, content, options);
}

/**
 * @param amqpChannel
 * @param {RedisConnectionClass} redis
 * @param {Object} limitations
 */
const consumer = (amqpChannel, redis, limitations) => {
  amqpChannel.consume(queue, async (msg) => {
    const handleRejectedMsg = reasonOfFail => sendMsgToRetry({
      msg, queue, amqpChannel, reasonOfFail,
    }, limitations);
    const data = JSON.parse(msg.content);
    const userLimit = await redis.redisGet(`user#${data.user}`);
    const groupLimit = await redis.redisGet(`group#${data.group}`);
    if (userLimit < limitations.userLimit && groupLimit < limitations.groupLimit) {
      if (userLimit === null) {
        await redis.redisSet(`user#${data.user}`, 0, limitations.userIntervalMs);
      }
      if (groupLimit === null) {
        await redis.redisSet(`group#${data.group}`, 0, limitations.groupIntervalMs);
      }
      await redis.redisIncr(`group#${data.group}`);
      await redis.redisIncr(`user#${data.user}`);
    } else {
      return handleRejectedMsg({
        userLimit: (userLimit < limitations.userLimit),
        groupLimit: (groupLimit < limitations.groupLimit),
      });
    }
    console.log(userLimit, groupLimit);
    fs.appendFileSync(`${__dirname}/../log/${data.user}.${data.group}`, `${JSON.stringify(data)}\n`);
    return amqpChannel.ack(msg);
  }, { noAck: false });
};

module.exports = consumer;
