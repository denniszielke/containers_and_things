Using
https://github.com/tensorflow/serving/blob/master/tensorflow_serving/example/mnist_saved_model.py

# Create a saved model after training with a container
```bash
docker run --mount type=bind,source=C:\Users\danmeix\Desktop\smout,target=/tmp/sm -it mnistsavedmodel --training_iteration=100 --model_version=1 /tmp/sm/out
```

# run docker build to build serving container (make sure path is correct in dockerfile)
docker build -t mnistserving .

# run saved model 
docker  run -it -p 8501:8501   -t mnistserving

# Analyse API / Signatures
Mount the path which contains Saved_model
```
docker run --mount type=bind,source=C:\Users\danmeix\Desktop\smout,target=/tmp/sm -it tensorflow/tensorflow
docker exec -it 3e8ffa5a25ca  bash
```
navigate via cd to the /tmp/sm folder where saved_model.pb lives
```
saved_model_cli show --dir ./ --all
```


# Example output of signature

```
root@3e8ffa5a25ca:/tmp/sm/out/1# saved_model_cli show --dir ./ --all

MetaGraphDef with tag-set: 'serve' contains the following SignatureDefs:

signature_def['predict_images']:
  The given SavedModel SignatureDef contains the following input(s):
    inputs['images'] tensor_info:
        dtype: DT_FLOAT
        shape: (-1, 784)
        name: x:0
  The given SavedModel SignatureDef contains the following output(s):
    outputs['scores'] tensor_info:
        dtype: DT_FLOAT
        shape: (-1, 10)
        name: y:0
  Method name is: tensorflow/serving/predict

signature_def['serving_default']:
  The given SavedModel SignatureDef contains the following input(s):
    inputs['inputs'] tensor_info:
        dtype: DT_STRING
        shape: unknown_rank
        name: tf_example:0
  The given SavedModel SignatureDef contains the following output(s):
    outputs['classes'] tensor_info:
        dtype: DT_STRING
        shape: (-1, 10)
        name: index_to_string_Lookup:0
    outputs['scores'] tensor_info:
        dtype: DT_FLOAT
        shape: (-1, 10)
        name: TopKV2:0
  Method name is: tensorflow/serving/classify
root@3e8ffa5a25ca:/tmp/sm/out/1#
```