var SNSPushAdapter = require('./SNSPushAdapter');
var log = require('npmlog');

module.exports = SNSPushAdapter;
module.exports.default = SNSPushAdapter;

if (process.env.VERBOSE || process.env.VERBOSE_PARSE_SERVER_SNS_ADAPTER) {
  log.level = 'verbose';
}
