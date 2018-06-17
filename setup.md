# Create azure resources

IOT_HUB_NAME=dzthings
IOT_GROUP=CloudAndThings
LOCATION=westeurope

az group create -n $IOT_GROUP -l $LOCATION

az iot hub create --resource-group $IOT_GROUP --name $IOT_HUB_NAME --sku F1 --location $LOCATION