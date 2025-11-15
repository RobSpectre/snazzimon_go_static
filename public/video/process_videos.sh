#!/bin/bash

# Batch process all videos in current directory
# Creates _low versions with optimized compression

count=0
total=$(ls -1 *.mp4 | grep -v "_low.mp4" | wc -l)

echo "Processing $total videos..."

for video in *.mp4; do
    # Skip if already a _low version
    if [[ "$video" == *"_low.mp4" ]]; then
        continue
    fi
    
    # Skip if _low version already exists
    base="${video%.mp4}"
    output="${base}_low.mp4"
    
    if [[ -f "$output" ]]; then
        echo "Skipping $video (already processed)"
        continue
    fi
    
    ((count++))
    echo "[$count/$total] Processing: $video -> $output"
    
    # Optimize with:
    # - CRF 24 (good quality, smaller size)
    # - 30fps (reduce from 60fps)
    # - medium preset (good compression/speed balance)
    # - faststart (web streaming optimization)
    ffmpeg -i "$video" \
        -c:v libx264 \
        -crf 24 \
        -preset medium \
        -r 30 \
        -movflags +faststart \
        -c:a aac \
        -b:a 128k \
        "$output" \
        -y \
        -loglevel error -stats
    
    # Show file size comparison
    original_size=$(du -h "$video" | cut -f1)
    new_size=$(du -h "$output" | cut -f1)
    echo "  Original: $original_size -> Compressed: $new_size"
    echo ""
done

echo "Done! Processed $count videos."
