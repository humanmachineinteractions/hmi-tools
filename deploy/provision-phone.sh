#!/usr/bin/env bash

cd /home/vagrant
#open fst
wget http://openfst.org/twiki/pub/FST/FstDownload/openfst-1.4.1.tar.gz
tar -xvzf openfst-1.4.1.tar.gz
cd openfst-1.4.1
./configure --enable-compact-fsts --enable-const-fsts --enable-far --enable-lookahead-fsts --enable-pdt --enable-ngram-fsts
sudo make install
cd ..
#open ngram
wget http://openfst.cs.nyu.edu/twiki/pub/GRM/NGramDownload/opengrm-ngram-1.2.1.tar.gz
tar -xvzf opengrm-ngram-1.2.1.tar.gz
cd opengrm-ngram-1.2.1
./configure
sudo make install
cd ..
# phonetsaurus
git clone https://github.com/AdolfVonKleist/Phonetisaurus.git
cd Phonetisaurus/src
make -j 4
sudo make install
cd ..
sudo python setup.py install
export LD_LIBRARY_PATH=/usr/local/lib
cd script/
wget https://www.dropbox.com/s/vlmlfq52rpbkniv/cmu-eg.me-kn.8g.arpa.gz?dl=0 -O test.arpa.gz
gunzip test.arpa.gz
phonetisaurus-arpa2wfst-omega --lm=test.arpa --ofile=test.fst
# see https://github.com/AdolfVonKleist/Phonetisaurus