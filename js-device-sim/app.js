'use strict';
require('dotenv-extended').load();
const express = require('express');
const http = require('http');
const app = express();
const morgan = require('morgan');
const request = require('request');
const OS = require('os');
const WebSocket = requires('ws');
const config = require('./config');
const appInsights = require("applicationinsights");

if (config.instrumentationKey){ 
    appInsights.setup(config.instrumentationKey);
    appInsights.start();
    appInsights.defaultClient.context.keys.cloudRole = "simulator";
}

var Mqtt = require('azure-iot-device-mqtt').Mqtt;
var DeviceClient = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;
var client = DeviceClient.fromConnectionString(config.iotConnectionString, Mqtt);
var publicDir = require('path').join(__dirname, '/public');

// add logging middleware
app.use(morgan('dev'));
app.use(express.static(publicDir));
const server = http

// Routes
app.get('/ping', function(req, res) {
    client.trackEvent({ name: 'ping-js-devicesim-received' });
    console.log('received ping');
    res.send('Pong');
});

app.get('/api/getappinsightskey', function(req, res) {
    console.log('returned app insights key');
    if (config.instrumentationKey){ 
        res.send(config.instrumentationKey);
    }
    else{
        res.send('');
    }
});

app.post('/api/sendstatus', function(req, res) {
    console.log("received trigger request:");
    console.log(req.headers.devicestatus);
    if (config.instrumentationKey){ 
        var startDate = new Date();
        client.trackEvent( { name: "sendstatus-js-devicesim-call"});
    }
        
    var data = JSON.stringify({ deviceId: config.deviceId, status: req.headers.devicestatus, host: OS.hostname()});
    var message = new Message(data);
    // message.properties.add('temperatureAlert', (temperature > 30) ? 'true' : 'false');
    console.log("Sending message: " + message.getData());
    client.sendEvent(message, printResultFor('send', res));
   
});

function printResultFor(op, response) {
    return function printResult(err, res) {
        if (err) {
            console.log(op + ' error: ' + err.toString());
            response.send(op + ' error: ' + err.toString());
        }
        if (res) {
            console.log(op + ' status: ' + res.constructor.name);
            response.send(op + ' status: ' + res.constructor.name);
        }
    };
}

var connectCallback = function (err) {
    if (err) {
        console.log('Could not connect: ' + err);
    } else {
        console.log('Client connected');
    }
};

console.log(config);
console.log(OS.hostname());
// Listen
if (config.instrumentationKey){ 
    client.trackEvent({ name: "jsdevicesim-initializing"});
}
app.listen(config.port);
console.log('Listening on localhost:'+ config.port);

console.log("starting up...");
client.open(connectCallback);