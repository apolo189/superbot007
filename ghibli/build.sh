#!/bin/bash
set -e
cd /home/user/webapp/ghibli

SCENES="scenes"
AUDIO="audio"
CLIPS="clips"
OUT="MARIA_SUPERBOT007.mp4"

echo "=== BUILDING GHIBLI VIDEO ==="

make_clip() {
  local num=$1
  local img="$SCENES/s${num}.png"
  local aud="$AUDIO/s${num}.mp3"
  local out="$CLIPS/clip${num}.mp4"
  local dur=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$aud")

  echo "Clip $num: ${dur}s"

  ffmpeg -y -loop 1 -framerate 25 -t "$dur" \
    -i "$img" \
    -i "$aud" \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1" \
    -c:v libx264 -preset fast -crf 22 \
    -c:a aac -b:a 128k \
    -pix_fmt yuv420p \
    -shortest \
    -movflags +faststart \
    "$out" -loglevel error
  echo "  OK: $(du -h $out | cut -f1)"
}

for i in 01 02 03 04 05 06 07 08 09; do
  make_clip "$i"
done

echo "=== CONCATENATING ==="
cat > "$CLIPS/list.txt" << EOF
file 'clip01.mp4'
file 'clip02.mp4'
file 'clip03.mp4'
file 'clip04.mp4'
file 'clip05.mp4'
file 'clip06.mp4'
file 'clip07.mp4'
file 'clip08.mp4'
file 'clip09.mp4'
EOF

ffmpeg -y -f concat -safe 0 -i "$CLIPS/list.txt" -c copy "$OUT" -loglevel error

DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUT")
SIZE=$(du -h "$OUT" | cut -f1)
echo "=== DONE ==="
echo "Video: $OUT | Duration: ${DUR}s | Size: $SIZE"
