#!/bin/bash



BASE=/home/vagrant/
PATH=$BASE/bin:$PATH
ROOT=$BASE/sw

cd $BASE
mkdir $ROOT

sudo apt-get install -y make g++ libncurses5-dev csh
sudo apt-get install -y tcl8.4
sudo apt-get install -y libsnack2
sudo apt-get install -y bc
sudo apt-get install -y sox



################# HTK
#cd $BASE
#cp HTK-3.4.1.tar.gz $root/sw
#cp HDecode-3.4.1.tar.gz $root/sw
#cd $root/sw
#mkdir -p HTS-patch
#cd HTS-patch
#wget http://hts.sp.nitech.ac.jp/archives/2.2/HTS-2.2_for_HTK-3.4.1.tar.bz2
#tar -jxvf HTS-2.2_for_HTK-3.4.1.tar.bz2
#cd ..
#tar -zxf HTK-3.4.1.tar.gz
#tar -zxf HDecode-3.4.1.tar.gz
#cd htk
#cp $root/sw/HTS-patch/HTS-2.2_for_HTK-3.4.1.patch .
#patch -p1 -d . < HTS-2.2_for_HTK-3.4.1.patch
#./configure --prefix=$root MAXSTRLEN=2048
#make
#make install
## And compile HDecode
#make hdecode
#make install-hdecode
#
#
#
#cd $root/sw
#wget http://downloads.sourceforge.net/hts-engine/hts_engine_API-1.05.tar.gz
#tar -zxf hts_engine_API-1.05.tar.gz
#cd hts_engine_API-1.05
#./configure --prefix=$root
#make
#make install




################# SPTK
cd $ROOT
wget http://downloads.sourceforge.net/sp-tk/SPTK-3.8.tar.gz
tar -zxvf SPTK-3.8.tar.gz
cd SPTK-3.8
./configure
make
sudo make install




# speech tools
cd $ROOT
wget http://festvox.org/packed/festival/2.4/speech_tools-2.4-release.tar.gz
tar xvfz speech_tools-2.4-release.tar.gz
cd speech_tools
./configure
make


# festvox
cd $ROOT
wget http://festvox.org/festvox-2.7/festvox-2.7.0-release.tar.gz
tar xvfz festvox-2.7.0-release.tar.gz
cd festvox
./configure
make
cd ..

#festival
cd $ROOT
wget http://festvox.org/packed/festival/2.4/festival-2.4-release.tar.gz
wget http://www.cstr.ed.ac.uk/downloads/festival/2.4/festlex_CMU.tar.gz
wget http://www.cstr.ed.ac.uk/downloads/festival/2.4/festlex_OALD.tar.gz
wget http://www.cstr.ed.ac.uk/downloads/festival/2.4/festlex_POSLEX.tar.gz
wget http://www.cstr.ed.ac.uk/downloads/festival/2.4/voices/festvox_kallpc16k.tar.gz
wget http://www.cstr.ed.ac.uk/downloads/festival/2.4/voices/festvox_rablpc16k.tar.gz

tar xvfz festival-2.4-release.tar.gz
tar xvfz festlex_CMU.tar.gz
tar xvfz festlex_OALD.tar.gz
tar xvfz festlex_POSLEX.tar.gz
tar xvfz festvox_kallpc16k.tar.gz
tar xvfz festvox_kallpc16k.tar.gz
cd festival
./configure
make

#flite
cd $ROOT
wget http://www.festvox.org/flite/packed/flite-2.0/flite-2.0.0-release.tar.bz2
tar xvfj flite-2.0.0-release.tar.bz2
cd flite-2.0.0-release
./configure
make

#
echo "export ESTDIR=${ROOT}/speech_tools" >> ~/.bashrc
echo "export FESTVOXDIR=${ROOT}/festvox" >> ~/.bashrc
echo "export SPTKDIR=/usr/local/bin" >> ~/.bashrc
echo "export FLITEDIR=${ROOT}/flite-2.0.0-release"  >> ~/.bashrc