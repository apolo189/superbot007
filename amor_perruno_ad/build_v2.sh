#!/bin/bash
set -e

echo "=== BUILDING AMOR PERRUNO AD V2 (with narration + music) ==="

NARR="amor_perruno_ad/narracion_amor_perruno.mp3"
MUSIC="../enrique_v2/musica.mp3"
VIDEO_NOAUDIO="amor_perruno_ad/video_noaudio.mp4"
OUT="amor_perruno_ad/AMOR_PERRUNO_AD_V2_FINAL.mp4"

NARR_DUR=41.22
VIDEO_DUR=50.48

# Since narration (41s) < video (50s), we'll:
# Option 1: trim video to narration length + 2s fade
# Option 2: keep video as is and let music fill the end
# We'll trim video to 43s (41s narr + 2s pause at end with music)

echo "Step 1: Trim video to 43 seconds..."
ffmpeg -y -i "$VIDEO_NOAUDIO" -t 43 -c copy amor_perruno_ad/video_trimmed.mp4 2>/dev/null
echo "Video trimmed: $(ffprobe -v quiet -show_entries format=duration -of csv=p=0 amor_perruno_ad/video_trimmed.mp4)s"

echo ""
echo "Step 2: Mix narration + music at 15% volume..."
# Mix: narration full volume + music soft background at 0.15
# Trim music to video duration (43s)
ffmpeg -y \
  -i "$NARR" \
  -i "$MUSIC" \
  -filter_complex "[1:a]volume=0.15,atrim=0:43[music];[0:a][music]amix=inputs=2:duration=first:dropout_transition=2[aout]" \
  -map "[aout]" \
  -ar 44100 -ac 2 -b:a 192k \
  amor_perruno_ad/audio_v2_mix.mp3 2>/dev/null
echo "Audio mix done: $(ffprobe -v quiet -show_entries format=duration -of csv=p=0 amor_perruno_ad/audio_v2_mix.mp3)s"

echo ""
echo "Step 3: Combine video + audio..."
ffmpeg -y \
  -i amor_perruno_ad/video_trimmed.mp4 \
  -i amor_perruno_ad/audio_v2_mix.mp3 \
  -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 192k \
  -shortest \
  "$OUT" 2>/dev/null

FINAL_DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUT")
FINAL_SIZE=$(du -sh "$OUT" | cut -f1)
echo ""
echo "=== DONE ==="
echo "Output: $OUT"
echo "Duration: ${FINAL_DUR}s"
echo "Size: $FINAL_SIZE"
