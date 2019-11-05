const nconf = require('nconf');
nconf.formats.yaml = require('nconf-yaml');

module.exports = file => nconf.file({
  file,
  format: nconf.formats.yaml,
}).get();
