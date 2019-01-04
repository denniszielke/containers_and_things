var config = {}

config.partitionId = process.env.PARTITION_ID;
config.iotConnectionString = process.env.IOTHUB_CONNECTION;
config.storageConnectionString = process.env.STORAGE_CONNECTION;
config.endPoint = process.env.SERVING_HOST;

module.exports = config;
