#!/bin/sh
sudo su
apt-get update
apt-get install -y git
apt-get install build-essential python-dev python-software-propertie --no-install-recommends
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
sudo apt-get install python-pip
sudo pip install pymongo


#checkout MITIE & build
#checkout marytts & build
#run mary external/check_install.sh (HTS, HDecode in this dir)