var config = {}

config.partitionId = process.env.PARTITION_ID;
config.iotConnectionString = process.env.IOTHUB_CONNECTION;
config.redisHost = process.env.REDIS_HOST;
config.redisAuth = process.env.REDIS_AUTH;

module.exports = config;
