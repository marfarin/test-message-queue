const { ObjectId } = require('mongodb');

/**
 * @param {Object} config
 * @returns {Array.String}
 */
const userGenerator = (config) => {
  const users = [];
  for (let i = 0; i < config.userCount; i += 1) {
    users.push(new ObjectId().toString());
  }
  return users;
};

/**
 * @param {Object} config
 * @returns {Array.String}
 */
const groupGenerator = (config) => {
  const groups = [];
  for (let i = 0; i < config.groupCount; i += 1) {
    groups.push(new ObjectId().toString());
  }
  return groups;
};

const getRandomInt = max => Math.floor(Math.random() * Math.floor(max));

/**
 * @param {Object} config
 * @param {Array.String} users
 * @param {Array.String} groups
 * @param {String} message
 * @returns {{message: *, user: *, group: *}}
 */
const generateMessage = (config, users, groups, message) => ({
  message,
  user: users[getRandomInt(config.userCount)],
  group: groups[getRandomInt(config.groupCount)],
});

/**
 * @param {Object} config
 * @param {Array.String} users
 * @param {Array.String} groups
 */
const messageGenerator = (config, users, groups) => {
  const payloads = [];
  const totalCountMessages = config.userCount * config.messagePerUser;
  for (let i = 0; i < totalCountMessages; i += 1) {
    const message = generateMessage(config, users, groups, i.toString(10));
    payloads.push(message);
  }
  return payloads;
};

module.exports = { userGenerator, groupGenerator, messageGenerator };
