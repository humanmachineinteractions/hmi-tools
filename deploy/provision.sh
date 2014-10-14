#!/bin/sh
sudo su
apt-get update
apt-get install -y git
apt-get install build-essential python-dev python-software-properties --no-install-recommends
apt-get install -y redis-server --no-install-recommends
apt-get install -y openjdk-7-jdk maven
#update-alternatives --config java
add-apt-repository ppa:chris-lea/node.js
add-apt-repository ppa:dhor/myway
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
apt-get update
apt-get install -y graphicsmagick
apt-get install -y nodejs
apt-get install -y mongodb-10gen
apt-get install python-pip
pip install pymongo
apt-get install -y openjdk-7-jdk maven
update-alternatives --config java
apt-get install speech-tools
#checkout MITIE & build
#checkout marytts & build
cd /home/vagrant
git clone https://github.com/marytts/marytts.git
cd marytts
mvn install
#run mary external/check_install.sh (HTS, HDecode in this dir)
#stanford nlp
cd /home/vagrant
wget http://nlp.stanford.edu/software/stanford-corenlp-full-2014-06-16.zip
unzip stanford-corenlp-full-2014-06-16.zip
mv stanford-corenlp-full-2014-06-16 corenlp
wget http://nlp.stanford.edu/software/stanford-corenlp-models-current.jar
mv stanford-corenlp-models-current.jar corenlp/