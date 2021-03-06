# Copyright 2016 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================

#!/usr/bin/env python2.7

"""Functions for downloading and reading MNIST data."""

from __future__ import print_function

import gzip
import os
import pandas as pd

import numpy
from six.moves import urllib

# CVDF mirror of http://yann.lecun.com/exdb/mnist/
SOURCE_URL = 'https://storage.googleapis.com/cvdf-datasets/mnist/'
TRAIN_IMAGES = 'train-images-idx3-ubyte.gz'
TRAIN_LABELS = 'train-labels-idx1-ubyte.gz'
TEST_IMAGES = 't10k-images-idx3-ubyte.gz'
TEST_LABELS = 't10k-labels-idx1-ubyte.gz'
VALIDATION_SIZE = 5000


def maybe_download(filename, work_directory):
  """Download the data from Yann's website, unless it's already here."""
  if not os.path.exists(work_directory):
    os.mkdir(work_directory)
  filepath = os.path.join(work_directory, filename)
  if not os.path.exists(filepath):
    filepath, _ = urllib.request.urlretrieve(SOURCE_URL + filename, filepath)
    statinfo = os.stat(filepath)
    print('Successfully downloaded %s %d bytes.' % (filename, statinfo.st_size))
  return filepath


def _read32(bytestream):
  dt = numpy.dtype(numpy.uint32).newbyteorder('>')
  return numpy.frombuffer(bytestream.read(4), dtype=dt)[0]


def extract_images(filename):
  """Extract the images into a 4D uint8 numpy array [index, y, x, depth]."""
  print('Extracting %s' % filename)
  with gzip.open(filename) as bytestream:
    magic = _read32(bytestream)
    if magic != 2051:
      raise ValueError(
          'Invalid magic number %d in MNIST image file: %s' %
          (magic, filename))
    num_images = _read32(bytestream)
    rows = _read32(bytestream)
    cols = _read32(bytestream)
    buf = bytestream.read(rows * cols * num_images)
    data = numpy.frombuffer(buf, dtype=numpy.uint8)
    data = data.reshape(num_images, rows, cols, 1)
    return data


def dense_to_one_hot(labels_dense, num_classes=10):
  """Convert class labels from scalars to one-hot vectors."""
  num_labels = labels_dense.shape[0]
  index_offset = numpy.arange(num_labels) * num_classes
  labels_one_hot = numpy.zeros((num_labels, num_classes))
  labels_one_hot.flat[index_offset + labels_dense.ravel()] = 1
  return labels_one_hot


def extract_labels(filename, one_hot=False):
  """Extract the labels into a 1D uint8 numpy array [index]."""
  print('Extracting %s' % filename)
  with gzip.open(filename) as bytestream:
    magic = _read32(bytestream)
    if magic != 2049:
      raise ValueError(
          'Invalid magic number %d in MNIST label file: %s' %
          (magic, filename))
    num_items = _read32(bytestream)
    buf = bytestream.read(num_items)
    labels = numpy.frombuffer(buf, dtype=numpy.uint8)
    if one_hot:
      return dense_to_one_hot(labels)
    return labels


class DataSet(object):
  """Class encompassing test, validation and training MNIST data set."""

  def __init__(self, images, labels, fake_data=False, one_hot=False):
    """Construct a DataSet. one_hot arg is used only if fake_data is true."""

    if fake_data:
      self._num_examples = 10000
      self.one_hot = one_hot
    else:
      assert images.shape[0] == labels.shape[0], (
          'images.shape: %s labels.shape: %s' % (images.shape,
                                                 labels.shape))
      self._num_examples = images.shape[0]

      # Convert shape from [num examples, rows, columns, depth]
      # to [num examples, rows*columns] (assuming depth == 1)
      assert images.shape[3] == 1
      images = images.reshape(images.shape[0],
                              images.shape[1] * images.shape[2])
      # Convert from [0, 255] -> [0.0, 1.0].
      images = images.astype(numpy.float32)
      images = numpy.multiply(images, 1.0 / 255.0)
    self._images = images
    self._labels = labels
    self._epochs_completed = 0
    self._index_in_epoch = 0

  @property
  def images(self):
    return self._images

  @property
  def labels(self):
    return self._labels

  @property
  def num_examples(self):
    return self._num_examples

  @property
  def epochs_completed(self):
    return self._epochs_completed

  def next_batch(self, batch_size, fake_data=False):
    """Return the next `batch_size` examples from this data set."""
    if fake_data:
      fake_image = [1] * 784
      if self.one_hot:
        fake_label = [1] + [0] * 9
      else:
        fake_label = 0
      return [fake_image for _ in range(batch_size)], [
          fake_label for _ in range(batch_size)
      ]
    start = self._index_in_epoch
    self._index_in_epoch += batch_size
    if self._index_in_epoch > self._num_examples:
      # Finished epoch
      self._epochs_completed += 1
      # Shuffle the data
      perm = numpy.arange(self._num_examples)
      numpy.random.shuffle(perm)
      self._images = self._images[perm]
      self._labels = self._labels[perm]
      # Start next epoch
      start = 0
      self._index_in_epoch = batch_size
      assert batch_size <= self._num_examples
    end = self._index_in_epoch
    return self._images[start:end], self._labels[start:end]


def read_data_sets(train_dir, fake_data=False, one_hot=False):
  """Return training, validation and testing data sets."""

  class DataSets(object):
    pass

  data_sets = DataSets()

#dmx: comment out, load from csv
  # if fake_data:
  #   data_sets.train = DataSet([], [], fake_data=True, one_hot=one_hot)
  #   data_sets.validation = DataSet([], [], fake_data=True, one_hot=one_hot)
  #   data_sets.test = DataSet([], [], fake_data=True, one_hot=one_hot)
  #   return data_sets

  # #skip -load from csv (dmx)
  # local_file = maybe_download(TRAIN_IMAGES, train_dir)
  # train_images = extract_images(local_file)

  # local_file = maybe_download(TRAIN_LABELS, train_dir)
  # train_labels = extract_labels(local_file, one_hot=one_hot)

  # local_file = maybe_download(TEST_IMAGES, train_dir)
  # test_images = extract_images(local_file)

  # local_file = maybe_download(TEST_LABELS, train_dir)
  # test_labels = extract_labels(local_file, one_hot=one_hot)
 

  # init
  nr_of_px = 784
  nr_of_pix_x = 28
  nr_of_pix_y = 28
  nr_of_classes = 10
  nr_of_val_ds = 5000
  nr_of_test_ds = 10000
  nr_of_train_ds= 55000


  # tmp: dmx Export of CSV
  # print ("exporting csv")
  # tri=pd.DataFrame.from_dict(train_images.reshape(nr_of_train_ds,nr_of_px))
  # tri.to_csv(path_or_buf="/mnt/mnistcsv/mnist_train_images.csv", index=False,header=False)
  # print ("exporting csv")
  # tei=pd.DataFrame.from_dict(test_images.reshape(nr_of_test_ds,nr_of_px))
  # tei.to_csv(path_or_buf="/mnt/mnistcsv/mnist_test_images.csv", index=False,header=False)
  # print ("exporting csv")
  # trl=pd.DataFrame.from_dict(train_labels.reshape(nr_of_train_ds,nr_of_classes))
  # trl.to_csv(path_or_buf="/mnt/mnistcsv/mnist_train_labels.csv", index=False,header=False)
  # print ("exporting csv")
  # tel=pd.DataFrame.from_dict(test_labels.reshape(nr_of_test_ds,nr_of_classes))
  # tel.to_csv(path_or_buf="/mnt/mnistcsv/mnist_test_labels.csv", index=False,header=False)

  # now import from csv
  print ("start import")
  tr_l_in=pd.read_csv('/mnt/mnistcsv/mnist_train_labels.csv', sep=',',header=None).values
  train_labels= tr_l_in.reshape(nr_of_train_ds, nr_of_classes)

  print ("start import2")
  te_l_in=pd.read_csv('/mnt/mnistcsv/mnist_test_labels.csv', sep=',',header=None).values
  test_labels= te_l_in.reshape(nr_of_test_ds, nr_of_classes)

  test_img_in=pd.read_csv('/mnt/mnistcsv/mnist_test_images.csv', sep=',',header=None).values
  test_images= test_img_in.reshape(nr_of_test_ds, nr_of_pix_x, nr_of_pix_y, 1)

  train_img_in=pd.read_csv('/mnt/mnistcsv/mnist_train_images.csv', sep=',',header=None).values
  train_images= train_img_in.reshape(nr_of_train_ds, nr_of_pix_x, nr_of_pix_y, 1)

  # moved down, for var ref
  train_images = train_images[VALIDATION_SIZE:]
  train_labels = train_labels[VALIDATION_SIZE:]
  print (test_images.shape)
  print (train_images.shape)
  print (train_labels.shape)
  print (train_labels.shape)

  #print (train_images[0])
  

  validation_images = train_images[:VALIDATION_SIZE]
  validation_labels = train_labels[:VALIDATION_SIZE]
  data_sets.train = DataSet(train_images, train_labels)
  data_sets.validation = DataSet(validation_images, validation_labels)
  data_sets.test = DataSet(test_images, test_labels)

  return data_sets