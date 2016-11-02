#!/bin/bash

echo Running first script;

cd /home/ubuntu/YouTube-Data-Analysis/hadoopjars;

/opt/hadoop/bin/hadoop fs -rm -r /outcategory;


/opt/hadoop/bin/hadoop fs -rm -r /outuploader;


/opt/hadoop/bin/hadoop fs -rm -r /outview;

/opt/hadoop/bin/hadoop jar youtubecategory.jar /data.csv /outcategory;

/opt/hadoop/bin/hadoop jar youtubeuploader.jar /data.csv /outuploader;

/opt/hadoop/bin/hadoop jar youtubeview.jar /data.csv /outview;

echo Hadoop Jobs Ended;

echo Running sorting tasks;

cd /home/ubuntu/YouTube-Data-Analysis/output;

rm outcategory.tsv;

rm outuploader.tsv;

rm outview.tsv;

rm outcat.tsv;

rm outupl.tsv;

rm outvie.tsv;

/opt/hadoop/bin/hadoop fs -copyToLocal /outcategory/part-r-00000 '/home/ubuntu/YouTube-Data-Analysis/output/outcat.tsv';

/opt/hadoop/bin/hadoop fs -copyToLocal /outuploader/part-r-00000 '/home/ubuntu/YouTube-Data-Analysis/output/outupl.tsv';

/opt/hadoop/bin/hadoop fs -copyToLocal /outview/part-r-00000 '/home/ubuntu/YouTube-Data-Analysis/output/outvie.tsv';

sort -t$'\t' -n -k2 -r outcat.tsv | head -n5 > outcategory.tsv;

sort  -n -k2 -r outupl.tsv | head -n5 > outuploader.tsv;

sort  -t$'\t' -n -k2 -r outvie.tsv | head -n5 > outview.tsv;

echo Sorting tasks ended;



