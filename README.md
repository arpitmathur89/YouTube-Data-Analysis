# Youtube Data Analysis
YouTube allows billions of people to connect, inform, and inspire others across the globe using originally
created videos.

In our Project we analyze the data to identify the top 5 categories in which the most number of videos are uploaded. The dataset is gathered using the YouTube API and stored in Hadoop Distributed File System(HDFS).
MapReduce algorithm is applied to process the dataset and identify the video categories.

# Table of Contents

- [Installing Hadoop On Cluster Instructions](#installing-hadoop-on-cluster-instructions)
- [Obtaining Youtube API access key](#obtaining-youtube-api-access-key)
- [Install Node.js and node package manager](install-node.js-and-node-package-manager)
- [Run The Project](#run-the-project)
- [Description of each file](#description-of-each-file)


## Installing Hadoop On Cluster Instructions

 We are explaining the Hadoop cluster environment using four systems (one master and three slaves);
 Following are the IP addresses of the master and 3 slaves: master -192.168.1.7, slave 1- 192.168.1.6, slave 2- 192.168.1.9, slave 3- 192.168.1.4

 
### Installing Java

 Java is the main prerequisite for Hadoop. First of all, you should verify the existence of java in your system using “java -version”. 
` $ java -version `
 
If java is not installed in your system, then follow the given steps for installing java.


Step 1

Download java (JDK - X64.tar.gz) by visiting the following link http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html

Then jdk-7u71-linux-x64.tar.gz will be downloaded into your system.


Step 2

Generally you will find the downloaded java file in Downloads folder. Verify it and extract the jdk-7u71-linux-x64.gz file using the following commands.

`$ cd Downloads/`

`$ ls`

`jdk-7u79-Linux-x64.gz`

`$ tar zxf jdk-7u79-Linux-x64.gz`

`$ ls`

`jdk1.7.0_79 jdk-7u79-Linux-x64.gz`


Step 3

To make java available to all the users, you have to move it to the location “/usr/local/”. Open the root, and type the following commands.

`$ sudo mv jdk1.7.0_79 /usr/local/`


Step 4

For setting up PATH and JAVA_HOME variables, add the following commands to ~/.bashrc file.

`export JAVA_HOME=/usr/local/jdk1.7.0_79`

`export PATH=PATH:$JAVA_HOME/bin`


### Mapping the nodes

We have to edit hosts file in /etc/ folder on all nodes, specify the IP address of each system followed by their host names.


`$ sudo gedit /etc/hosts`

enter the following lines in the /etc/hosts file.

`192.168.1.7 hadoopmaster1`
`192.168.1.6 hadoopslave1`
`192.168.1.9 hadoopslave2`
`192.168.1.4 hadoopslave3`

Also edit the hostname file of each node.

### Configuring Key Based Login

Setup ssh in every node such that they can communicate with one another without any prompt for password.

`$ sudo ssh-keygen -t rsa` 

`$ sudo ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@hadoopmaster1` 

`$ sudo ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@hadoopslave1`

`$ sudo ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@hadoopslave2` 

`$ sudo ssh-copy-id -i ~/.ssh/id_rsa.pub ubuntu@hadoopslave3`

`$ sudo chmod 777 ~/.ssh/authorized_keys`


### Installing Hadoop

In the Master server, download and install Hadoop using the following commands.

`$ cd /opt/ `

`$ wget http://apache.mesi.com.ar/hadoop/common/hadoop-2.6.0/hadoop-2.6.0.tar.gz `

`$ tar -xzf hadoop-2.6.0.tar.gz `

`$ mv hadoop-2.6.0 hadoop `

`$ cd /opt/hadoop/ `


### Applying Common Hadoop Configuration :

However, we will be configuring Master-Slave architecture we need to apply the common changes in Hadoop config files (i.e. common for both type of Mater and Slave nodes) before we distribute these Hadoop files over the rest of the machines/nodes. Hence, these changes will be reflected over your single node Hadoop setup. After that, we will make changes specifically for Master and Slave nodes respectively.
Changes:


### Update core-site.xml

Update this file by changing hostname from localhost to HadoopMaster


To edit file, fire the below given command

ubuntu@hadoopmaster1:/opt/hadoop/etc/hadoop$ sudo gedit core-site.xml


Paste these lines into <configuration> tag OR Just update it by replacing localhost with master

<property>

  <name>fs.default.name</name>
  
  <value>hdfs://HadoopMaster:9000</value>
  
</property>


### Update hdfs-site.xml

Update this file by updating repliction factor from 1 to 3.


To edit file, fire the below given command

`ubuntu@hadoopmaster1:/opt/hadoop/etc/hadoop$ sudo gedit hdfs-site.xml`


Paste/Update these lines into <configuration> tag

<property>

  <name>dfs.replication</name>
  
  <value>3</value>
  
</property>


### Update yarn-site.xml

Update this file by updating the following three properties by updating hostname from localhost to HadoopMaster


To edit file, fire the below given command

`ubuntu@hadoopmaster1:/opt/hadoop/etc/hadoop$ sudo gedit yarn-site.xml`


Paste/Update these lines into <configuration> tag

<property>

	<name>yarn.resourcemanager.resource-tracker.address</name>
	
	<value>HadoopMaster:8025</value>
	
</property>

<property>

	<name>yarn.resourcemanager.scheduler.address</name>
	
	<value>HadoopMaster:8035</value>
	
</property>

<property>

	<name>yarn.resourcemanager.address</name>
	
	<value>HadoopMaster:8050</value>
	
</property>


### Update Mapred-site.xml

Update this file by updating and adding following properties,


To edit file, fire the below given command

`ubuntu@hadoopmaster1:/opt/hadoop/etc/hadoop$ sudo gedit mapred-site.xml`


Paste/Update these lines into <configuration> tag

<property>

	<name>mapreduce.job.tracker</name>
	
	<value>HadoopMaster:5431</value>
	
</property>

<property>

	<name>mapred.framework.name</name>
	
	<value>yarn</value>
	
</property>


### Update slaves

Update the directory of slave nodes of Hadoop cluster


To edit file, fire the below given command

`ubuntu@hadoopmaster1:/opt/hadoop/etc/hadoop$ sudo gedit slaves`


### Add name of slave nodes

hadoopslave1
hadoopslave2
hadoopslave3


### Format Namenonde (Run on MasterNode) :

 Run this command from Masternode

ubuntu@hadoopmaster1: /opt/hadoop/$ hdfs namenode -format


### Copy Hadoop distribution to other nodes:

`sudo scp -R /opt/hadoop/ ubuntu@hadoopslave1:/opt/`

`sudo scp -R /opt/hadoop/ ubuntu@hadoopslave2:/opt/`

`sudo scp -R /opt/hadoop/ ubuntu@hadoopslave3:/opt/`


### Starting Namenode, Datanode and ResourceManger:

`start-all.sh`


### Check if Hadoop started as desired using jps command.


## Obtaining Youtube API access key

Use the following link to obtain an API access key.

 https://youtu.be/JbWnRhHfTDA

## Install Node.js and node package manager


`sudo apt-get update`

`sudo apt-get install nodejs`

`sudo apt-get install npm`


After installing node.js and npm go to WebContent folder and run the below command to download all the dependencies.


`npm install`


## Run The Project

Run the nodejs server using the command.

`cd YouTube-Data-Analysis/WebContent/`

`nodejs app.js`

The project will be up and running at port `http://localhost:8080`

Click on `Get More Data` option on the sidebar to get new data via the YouTube API. After the data is stored in the server, a script will run in background to store the data in Hadoop File system.

Click on `Statistics` option on the sidebar to run the Hadoop MapReduce algorithm on the data. The `Analyze data` button will run the script to start hadoop MapReduce algorithm. The result will be displayed on the same webpage.

## Description of each file

Filename      | Purpose         | New/Modified      | Comments
------------- | ----------------|------------------ | ----------
YoutubeCategory.java | Mapper Reducer code to get top 5 categories  | New | Create JAR of this file to run in Hadoop system
YoutubeUploader.java | Mapper Reducer code to get top uploaders  | New | Create JAR of this file to run in Hadoop system
YoutubeView.java | Mapper Reducer code to get most viewed videos  | New | Create JAR of this file to run in Hadoop system
analyzedata.sh | Shell script to execute Hadoop commands | New | Merged Sorting commands in the file
getdata.sh | Shell script to copy the data file from server to HDFS | New | No Comments
app.js  | Main configuration file to run the entire application    |   Modified             | Changed client server communication from AJAX to socket.io
searchapi.js  | Connect to YouTube data API to fetch data in a file    |   Modified        | Changed callbacks and data to be fetched