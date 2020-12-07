#!/bin/bash

read -p 'Directory: ' dir



transmute() {
    
    name=$(basename $1)
    cleanName=${name%.*}
    
    ### Sourced settings from https://trac.ffmpeg.org/wiki/Encode/H.265
    
    ffmpeg -y -i $1 -c:v libx265 -b:v 2600k -x265-params pass=1 -an -f null /dev/null && \
    ffmpeg -i $1 -c:v libx265 -b:v 2600k -x265-params pass=2 -c:a aac -b:a 128k $cleanName.mp4
    
}

for f in $(find $dir -name '*.mp4' -or -name '*.mov'); do transmute $f; done