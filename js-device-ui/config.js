var config = {}

config.instrumentationKey = process.env.INSTRUMENTATIONKEY;
config.redisHost = process.env.REDIS_HOST;
config.redisAuth = process.env.REDIS_AUTH;

module.exports = config;
