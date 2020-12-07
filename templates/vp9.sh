#!/bin/bash

read -p 'Directory: ' file



transmute() {
    
    name=$(basename $1)
    cleanName=${name%.*}
    
    ### Sourced settings from https://streaminglearningcenter.com/blogs/encoding-vp9-in-ffmpeg-an-update.html
    
    ffmpeg -y -i $1 -c:v libvpx-vp9 -pass 1 -b:v 2000K -g 48 \
    -keyint_min 48 -sc_threshold 0 -threads 8 -speed 4 -row-mt 1 \
    -tile-columns 4 -f webm /dev/null
    
    ffmpeg -i $1 -c:v libvpx-vp9 -pass 2 -b:v 2000K -minrate 2000K \
    -maxrate 4000K -g 48 -keyint_min 48 -sc_threshold 0 -row-mt 1 -threads 8 \
    -speed 2 -tile-columns 4 $cleanName.webm
    
    ### Sourced settings from https://gist.github.com/Vestride/278e13915894821e1d6f#gistcomment-3023674
    
    ffmpeg -y -an -i $1 \
    -pass 1 -b:v 500K \
    -threads 0 -speed 4 -preset medium \
    -vf scale=-1:720 -r 24 \
    -c:v libvpx-vp9 \
    -tile-columns 0 -frame-parallel 0 -auto-alt-ref 1 -lag-in-frames 25 -g 9999 -aq-mode 0 \
    -f webm \
    /dev/null
    ffmpeg -y -an -i $1 \
    -pass 2 -b:v 500K \
    -threads 0 -speed 0 -preset medium \
    -vf scale=-1:720 -r 24 \
    -c:v libvpx-vp9 \
    -tile-columns 0 -frame-parallel 0 -auto-alt-ref 1 -lag-in-frames 25 -g 9999 -aq-mode 0 \
    -f webm \
    $cleanName-720-500k.webm
    
    
    
    ffmpeg -y -an -i $1 \
    -pass 1 -b:v 8000k \
    -threads 0 -speed 4 -preset medium \
    -c:v libvpx-vp9 \
    -tile-columns 8 -frame-parallel 0 -auto-alt-ref 1 -lag-in-frames 25 -g 9999 -aq-mode 0 \
    -f webm \
    /dev/null
    ffmpeg -y -an -i $1 \
    -pass 2 -b:v 8000k \
    -threads 0 -speed 0 -preset medium \
    -c:v libvpx-vp9 \
    -tile-columns 8 -frame-parallel 0 -auto-alt-ref 1 -lag-in-frames 25 -g 9999 -aq-mode 0 \
    -f webm \
    $cleanName-8000k.webm
    
    
    
}

for f in $(find $dir -name '*.mp4' -or -name '*.mov'); do transmute $f; done