'use strict';
require('dotenv-extended').load();
var config = require('./config');

var redis = require("redis");
var EventHubClient = require('azure-event-hubs').Client;
var RedisClient = redis.createClient(6380, config.redisHost, {auth_pass: config.redisAuth, tls: {servername: config.redisHost}});

var printError = function (err) {
    console.log(err.message);
};
  
var printMessage = function (message) {
    console.log('Message received: ');
    console.log(JSON.stringify(message.body));
    console.log('');
    
    RedisClient.hset("Devices", message.body.devicecId, message.body.temperature, redis.print);
};

var client = EventHubClient.fromConnectionString(config.iotConnectionString);
client.open()
    .then(client.getPartitionIds.bind(client))
    .then(function (partitionIds) {
        return partitionIds.map(function (partitionId) {
            return client.createReceiver('$Default', partitionId, { 'startAfterTime' : Date.now()}).then(function(receiver) {
                console.log('Created partition receiver: ' + partitionId)
                receiver.on('errorReceived', printError);
                receiver.on('message', printMessage);
            });
        });
    })
    .catch(printError);

console.log("starting up...");
