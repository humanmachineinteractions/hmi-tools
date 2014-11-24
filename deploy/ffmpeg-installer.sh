#!/bin/sh
#from https://trac.ffmpeg.org/wiki/UbuntuCompilationGuide

if [ ! -d "~/ffmpeg_sources" ]
then

    sudo apt-get update
    sudo apt-get -y install unzip autoconf automake build-essential libass-dev libgpac-dev \
      libsdl1.2-dev libtheora-dev libtool libva-dev libvdpau-dev libvorbis-dev libx11-dev \
      libxext-dev libxfixes-dev pkg-config texi2html zlib1g-dev
    mkdir ~/ffmpeg_sources


    #YASM

    cd ~/ffmpeg_sources
    wget http://www.tortall.net/projects/yasm/releases/yasm-1.2.0.tar.gz
    tar xzvf yasm-1.2.0.tar.gz
    cd yasm-1.2.0
    ./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin"
    make
    make install
    make distclean
    export "PATH=$PATH:$HOME/bin"


    #X264

    cd ~/ffmpeg_sources
    wget http://download.videolan.org/pub/x264/snapshots/last_x264.tar.bz2
    tar xjvf last_x264.tar.bz2
    cd x264-snapshot*
    ./configure --prefix="$HOME/ffmpeg_build" --bindir="$HOME/bin" --enable-static
    make
    make install
    make distclean


    #AAC

    cd ~/ffmpeg_sources
    wget -O fdk-aac.zip https://github.com/mstorsjo/fdk-aac/zipball/master
    unzip fdk-aac.zip
    cd mstorsjo-fdk-aac*
    autoreconf -fiv
    ./configure --prefix="$HOME/ffmpeg_build" --disable-shared
    make
    make install
    make distclean


    #LAME

    sudo apt-get -y install libmp3lame-dev


    cd ~/ffmpeg_sources
    wget http://downloads.xiph.org/releases/opus/opus-1.1.tar.gz
    tar xzvf opus-1.1.tar.gz
    cd opus-1.1
    ./configure --prefix="$HOME/ffmpeg_build" --disable-shared
    make
    make install
    make distclean


    #  VP8/VP9

    cd ~/ffmpeg_sources
    wget http://webm.googlecode.com/files/libvpx-v1.3.0.tar.bz2
    tar xjvf libvpx-v1.3.0.tar.bz2
    cd libvpx-v1.3.0
    ./configure --prefix="$HOME/ffmpeg_build" --disable-examples
    make
    make install
    make clean


    # FFMPEG

    cd ~/ffmpeg_sources
    wget http://ffmpeg.org/releases/ffmpeg-snapshot.tar.bz2
    tar xjvf ffmpeg-snapshot.tar.bz2
    cd ffmpeg
    PKG_CONFIG_PATH="$HOME/ffmpeg_build/lib/pkgconfig"
    export PKG_CONFIG_PATH
    ./configure --prefix="$HOME/ffmpeg_build" --extra-cflags="-I$HOME/ffmpeg_build/include"  --extra-ldflags="-L$HOME/ffmpeg_build/lib" --bindir="$HOME/bin" --extra-libs=-ldl --enable-gpl  --enable-libass --enable-libfdk-aac --enable-libmp3lame --enable-libopus --enable-libtheora --enable-libvorbis --enable-libvpx --enable-libx264 --enable-nonfree
    make
    make install
    make distclean
    hash -r
fi
