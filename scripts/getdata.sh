#!/bin/bash

echo Running script to copy data from localfile to HDFS;

/opt/hadoop/bin/hadoop fs -rm hdfs:/data.csv;

/opt/hadoop/bin/hadoop fs -copyFromLocal '/home/ubuntu/YouTube-Data-Analysis/WebContent/data.csv' hdfs:/
