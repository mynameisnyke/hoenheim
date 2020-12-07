#!/bin/bash

read -p 'Directory: ' file



transmute() {
    
    name=$(basename $1)
    cleanName=${name%.*}
    
    ### Sourced settings from https://gist.github.com/Vestride/278e13915894821e1d6f#gistcomment-3023674
    
    ffmpeg -y -an -i $1 \
    -pass 1 -b:v 1000K \
    -threads 0 -speed 4 -preset medium \
    -vf scale=-1:720 -r 24 \
    -c:v libx264 \
    -pix_fmt yuv420p -profile:v baseline -level 3.0 -movflags +faststart \
    -f mp4 \
    /dev/null
    ffmpeg -y -an -i $1 \
    -pass 2 -b:v 1000K \
    -threads 0 -speed 0 -preset medium \
    -vf scale=-1:720 -r 24 \
    -c:v libx264 \
    -pix_fmt yuv420p -profile:v baseline -level 3.0 -movflags +faststart \
    -f mp4 \
    $cleanName-720.mp4


    ### Sourced settings from https://gist.github.com/Vestride/278e13915894821e1d6f#gistcomment-3023674
    
    ffmpeg -y -an -i $1 \
    -pass 1 -b:v 8000K \
    -threads 0 -speed 4 -preset medium \
    -c:v libx264 \
    -pix_fmt yuv420p -profile:v baseline -level 3.0 -movflags +faststart \
    -f mp4 \
    /dev/null
    ffmpeg -y -an -i $1 \
    -threads 0 -speed 0 -preset medium \
    -vf scale=-1:720 -r 24 \
    -c:v libx264 \
    -pix_fmt yuv420p -profile:v baseline -level 3.0 -movflags +faststart \
    -f mp4 \
    $cleanName.mp4
    
   
 
}

for f in $(find $dir -name '*.mp4' -or -name '*.mov'); do transmute $f; done