'use strict';
require('dotenv-extended').load();
const express = require('express');
// const bodyParser = require('body-parser');
const http = require('http');
const app = express();
const morgan = require('morgan');
const request = require('request');
const OS = require('os');
const WebSocket = require('ws');
const config = require('./config');

var fs = require('fs');
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

app.post('/api/upload', function(req, res) {
    const imageEncoded = req.headers.image;
    console.log("stream length: " + imageEncoded.length);

    var filename = "out_"+ Math.floor(Math.random() * Math.floor(100))  +".jpeg";

    fs.open(filename, "a+",(err, fd) => {
        // Write our data
        fs.writeFile(fd, imageEncoded, {encoding: 'base64'}, (err) => {
            // Force the file to be flushed
            fs.fdatasync(fd, () => {
                var waitTill = new Date(new Date().getTime() + 1000);
                while(waitTill > new Date()){}
            } );
        });
    });

    console.log("written file to " + filename);
    var waitTill = new Date(new Date().getTime() + 1000);
    while(waitTill > new Date()){}

    try{
        fs.stat(filename, function (err, stats) {
            const rr = fs.createReadStream(filename);
        
            client.uploadToBlob(filename, rr, imageEncoded.length, function (err) {
                if (err) {
                    console.error('Error uploading file: ' + err.toString());
                    // res.send('Error');
                } else {
                    console.log('File uploaded');
                    var data = JSON.stringify({ deviceId: config.deviceId, status: "1", host: OS.hostname(), blob: filename});
                    var message = new Message(data);
                    console.log("Sending message: " + message.getData());
                    client.sendEvent(message, printResultFor('send', res));
                }
            });
        });
    }  catch(e){
        console.log(e);
    }

    res.send("ok");
});

app.post('/api/sendstatus', function(req, res) {
    console.log("received send status request:");
    console.log(req.headers.devicestatus);
        
    var data = JSON.stringify({ deviceId: config.deviceId, status: req.headers.devicestatus, host: OS.hostname(), blob: "7.png"});
    var message = new Message(data);
    // message.properties.add('temperatureAlert', (temperature > 30) ? 'true' : 'false');
    console.log("Sending message: " + message.getData());
    client.sendEvent(message, printResultFor('send', res));
   
});

app.post('/api/serve', function(req, res) {
    console.log("received send status request:");
    console.log(req.headers);
    res.send('OK'); 
});

app.post('/api/senddata', function(req, res) {
    console.log("received send temperature request:");
    var temperature = req.headers.temperature;
    var humidity = req.headers.humidity; 
    var data = JSON.stringify({ deviceId: config.deviceId, temperature: temperature, humidity: humidity, host: OS.hostname()});
    var message = new Message(data);
    message.properties.add('temperatureAlert', (temperature > 10) ? 'true' : 'false');
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
app.listen(config.port);
console.log('Listening on localhost:'+ config.port);

console.log("starting up...");
client.open(connectCallback);