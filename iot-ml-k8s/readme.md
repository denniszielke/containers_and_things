## 1.  Prep (py) code for Model training on KF
1. Take main.py code from model directory (based on https://github.com/Azure/kubeflow-labs/tree/master/1-docker/src )
1. Modify main.py code to output a model file afterwards. (Has already been done in model directory)

```python
export_path='/tmp/tensorflow/expmodel'
  print('exporting to %s ',export_path)
  builder = tf.saved_model.builder.SavedModelBuilder(export_path)
```

```python
builder.add_meta_graph_and_variables(sess, ["serve"])
  builder.save()
  print('saved')
```


1. CI will wrap file into a container.
1. Wrap this file into a tf container (c-training) using the tensorflow base image
```
FROM tensorflow/tensorflow:1.10.0
COPY main.py /app/main.py
ENTRYPOINT ["python", "/app/main.py"]
```
1. Create and publisch container image
```
docker build -t c-training:VERSIONNUMBER .
docker push c-training:VERSIONNUMBER
```


## 2. CI: Train a Model with KF 
1. To train a model with KF craete a TFJob on K8s.
1. To be able to get the output of the training we need an Azure Storage Account first.
1. The container is configured to write to /tmp/tensorFlow so we map this path to our volume in Azure files

```
apiVersion: kubeflow.org/v1alpha2
kind: TFJob
metadata:
  name: modeltraining
spec:
  tfReplicaSpecs:
    MASTER:
      replicas: 1
      template:
        spec:
          containers:
            # image contains model which will be trained here
            - image: c-training:VERSIONNUMBER
              name: mltrainingimage              
              volumeMounts:                
                - name: azurefile
                  # The subPath allows us to mount a subdirectory within the azure file share instead of root
                  # this is useful so that we can save the logs for each run in a different subdirectory
                  # instead of overwriting what was done before.
                  subPath: modeltraining-VERSIONNUMBER      # this is a subfolder in azure file share
                  mountPath: /tmp/tensorflow                # this is the path inside the container
          restartPolicy: OnFailure
          volumes:
            - name: azurefile
              persistentVolumeClaim:
                claimName: azurefile
```

## 3. CI: Get trained Model from KF Job
1. After running TFJob the versioned & trained model (.pkl) file should be located in Azure Storage.

## 4. CI: Wrap Model into a Serving Container (c-serving)

1. First try if everything works using the tensorflow/serving image by passing in the model files. (download the model from Azure Storage). In the sample below the local path of the model files is C:\Users\danmeix\Desktop\mlmodel. Put your model into a subfolder 01! 
```
docker  run -it -p 8501:8501 --mount type=bind,source=C:\Users\danmeix\Desktop\mlmodel\,target=/models/my_model  -e MODEL_NAME=my_model -t tensorflow/serving
```

1. Try to call it locally to test the model using test data.
```
# todo: local rest call
```

1. For CI we have to wrap the model into "TF Serving" (see also: https://www.tensorflow.org/serving/docker)
2. Here are the steps to do this manually.
```
# run tf base
docker run -d --name serving_base tensorflow/serving

# copy model into base container 
docker cp models/mymodel serving_base:/models/mymodel

# commit changes in base container and change env var to point to new model and store this as new container image "c-serving"
docker commit --change "ENV MODEL_NAME mymodel" serving_base c-serving

# Kill running instance
docker kill serving_base
```

# 5. CI Build and Push Container 
3. To automate image createion use a dockerfile like this.
```
FROM tensorflow/serving
COPY models/mymodel models/mymodel
```

1. Build and push your versioned container to a container registry to make it available for usage.
```
docker build . c-serving:VERSIONNUMBER
docker push c-serving:VERSIONNUMBER
```

