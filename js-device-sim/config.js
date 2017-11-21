var config = {}

config.deviceId = process.env.DEVICE_ID;
config.port = process.env.PORT;
config.iotConnectionString = process.env.IOTHUB_CONNECTION;

module.exports = config;
