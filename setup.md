# Create azure resources

```
PREFIX=dz
IOT_HUB_NAME=dzthings
FILE_STORAGE_NAME=dzthingfiles
AZURE_GROUP=iot_containers_ai
LOCATION=westeurope
DEVICE1_ID=dummydev3
```

```
az extension add --name azure-cli-iot-ext
```

1. create storage account
```
az storage account create --resource-group $AZURE_GROUP --name $FILE_STORAGE_NAME --location $LOCATION --sku Standard_LRS
``` 

1. create IoT Hub instance
```
az group create -n $AZURE_GROUP -l $LOCATION

az iot hub create --resource-group $AZURE_GROUP --name $IOT_HUB_NAME --sku F1 --location $LOCATION
```

2. create iot hub device
```
az iot hub device-identity create --resource-group $AZURE_GROUP --hub-name $IOT_HUB_NAME --device-id $DEVICE1_ID --edge-enabled
```

openCV image lib
https://github.com/microsoft/ell

