'use strict';
require('dotenv-extended').load();
const OS = require('os');
const config = require('./config');

const storage = require('azure-storage');
const { EventProcessorHost, delay } = require("@azure/event-processor-host");
const storageContainerName = "dev1upload";
const request = require('request');
const path = process.env.EVENTHUB_NAME || "";
const fs = require('fs');

var printError = function (err) {
    console.log(err.message);
};
  

console.log(config);
console.log(OS.hostname());

console.log("starting up...");

async function fileposter(blob) {
    const blobService = storage.createBlobService(config.storageConnectionString);
    console.log("downloading ..." + blob);
    
    blobService.getBlobToStream('dev1upload', config.partitionId +'/'+ blob , fs.createWriteStream(blob), function(error, result, response) {
        if (!error) {
          console.log("error while downloading:");
          console.log(result);
        }
        else{
          console.log("posting data to serving api:");
          var formData = {
            received: new Date().toLocaleString()
          };
          var options = { 
              'url': config.endpoint,
              'form': formData,
              'headers': {
                'source': 'zero'
              }
          }; 
          
          request.post(options, function(err, res, body) {
            console.log(body);
          });

          console.log(error);
        }
      });
}

async function main() {
    const eph = await EventProcessorHost.createFromIotHubConnectionString(
    EventProcessorHost.createHostName(OS.hostname()),
    config.storageConnectionString,
    storageContainerName,
    config.iotConnectionString,
    {
      eventHubPath: path
    }
  );
  let count = 0;
  // Message event handler
  const onMessage = async (context/*PartitionContext*/, data /*EventData*/) => {
    var date = new Date();
    console.log(date.toLocaleTimeString());
    console.log(">>>>> Rx message from '%s': '%s'", context.partitionId, data.body);
    console.log(data.body);
    if (data.body.blob){
        console.log("downloading " + data.body.blob);
        fileposter(data.body.blob).catch((err) => {
            console.log(err);
          });
    }

    count++;
    // let us checkpoint every 100th message that is received across all the partitions.
    if (count % 100 === 0) {
      return await context.checkpoint();
    }
  };
  // Error event handler
  const onError = (error) => {
    console.log(">>>>> Received Error: %O", error);
  };
  // start the EPH
  await eph.start(onMessage, onError);
  // After some time let' say 2 minutes
  await delay(120000);
//   // This will stop the EPH.
  await eph.stop();
}

main().catch((err) => {
    console.log(err);
  });