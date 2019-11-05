const amqp = require('amqplib/callback_api');

class RabbitConnectionClass {
  constructor(config) {
    this.uri = config.uri;
  }

  async init() {
    this.amqpConnection = await new Promise((resolve, reject) => {
      amqp.connect(this.uri, (error0, connection) => {
        if (error0) {
          return reject(error0);
        }
        return resolve(connection);
      });
    });
    this.amqpChannel = await new Promise((resolve, reject) => {
      this.amqpConnection.createChannel((error1, channel) => {
        if (error1) {
          return reject(error1);
        }
        return resolve(channel);
      });
    });
    return this;
  }

  close() {
    return this.amqpConnection.close();
  }
}

module.exports = async (config) => {
  const RabbitConnection = new RabbitConnectionClass(config);
  await RabbitConnection.init();
  return RabbitConnection;
};
