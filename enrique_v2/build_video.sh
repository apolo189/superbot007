#!/bin/bash
set -e

# Total narration = 175.14s, 9 scenes
# Scene timing plan (seconds):
# S1 compra:        0-19  (19s) - happy purchase
# S2 opening:      19-36  (17s) - grand opening nobody comes
# S3 bills:        36-53  (17s) - bills pile up
# S4 landlord:     53-70  (17s) - eviction notice
# S5 caos:         70-88  (18s) - total chaos/desperation
# S6 cliente:      88-105 (17s) - client offers link
# S7 descubrimiento: 105-127 (22s) - discovering chatbot
# S8 exito:        127-152 (25s) - restaurant packed / success
# S9 cta:          152-175 (23s) - happy + call to action
# Total = 175s ✓

echo "=== STRETCHING SCENES ==="

# Scene durations (target)
declare -A DURATIONS
DURATIONS[s1_compra]=19
DURATIONS[s2_opening]=17
DURATIONS[s3_bills]=17
DURATIONS[s4_landlord]=17
DURATIONS[s5_caos]=18
DURATIONS[s6_cliente]=17
DURATIONS[s7_descubrimiento]=22
DURATIONS[s8_exito]=25
DURATIONS[s9_cta]=23

SRC_DUR=5.042

for scene in s1_compra s2_opening s3_bills s4_landlord s5_caos s6_cliente s7_descubrimiento s8_exito s9_cta; do
  target=${DURATIONS[$scene]}
  pts=$(echo "scale=6; $target / $SRC_DUR" | bc)
  echo "Stretching $scene to ${target}s (pts=$pts)..."
  ffmpeg -y -i "${scene}.mp4" \
    -filter_complex "[0:v]setpts=${pts}*PTS[v]" \
    -map "[v]" \
    -c:v libx264 -preset fast -crf 20 \
    "${scene}_long.mp4" 2>/dev/null
  actual=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${scene}_long.mp4")
  echo "  → ${actual}s"
done

echo ""
echo "=== CONCATENATING VIDEO ==="

# Create concat list
cat > concat_list.txt << 'CLIST'
file 's1_compra_long.mp4'
file 's2_opening_long.mp4'
file 's3_bills_long.mp4'
file 's4_landlord_long.mp4'
file 's5_caos_long.mp4'
file 's6_cliente_long.mp4'
file 's7_descubrimiento_long.mp4'
file 's8_exito_long.mp4'
file 's9_cta_long.mp4'
CLIST

ffmpeg -y -f concat -safe 0 -i concat_list.txt \
  -c:v libx264 -preset fast -crf 20 \
  video_sin_audio.mp4 2>/dev/null

actual_video=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 video_sin_audio.mp4)
echo "Video concatenado: ${actual_video}s"

echo ""
echo "=== MIXING AUDIO ==="

# Mix narration (full vol) + music (18% vol), trim to video length
ffmpeg -y \
  -i narracion.mp3 \
  -i musica.mp3 \
  -filter_complex "[0:a]volume=1.0[narr];[1:a]volume=0.18[mus];[narr][mus]amix=inputs=2:duration=first:dropout_transition=2[aout]" \
  -map "[aout]" \
  -t "${actual_video}" \
  audio_mix.mp3 2>/dev/null

actual_audio=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 audio_mix.mp3)
echo "Audio mezclado: ${actual_audio}s"

echo ""
echo "=== FINAL VIDEO CON TEXTO CTA ==="

# Add title card + CTA text overlay on scene 9 (from 152s)
ffmpeg -y \
  -i video_sin_audio.mp4 \
  -i audio_mix.mp3 \
  -filter_complex "
    [0:v]
    drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:
      text='🤖 SuperBot007.com':
      fontsize=52:fontcolor=white:
      x=(w-text_w)/2:y=h-120:
      box=1:boxcolor=0x1a1a2e@0.85:boxborderw=18:
      enable='between(t,152,175)',
    drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:
      text='Crea tu bot y landing page HOY':
      fontsize=32:fontcolor=0xFFD700:
      x=(w-text_w)/2:y=h-60:
      box=1:boxcolor=0x1a1a2e@0.85:boxborderw=12:
      enable='between(t,155,175)'
    [vout]
  " \
  -map "[vout]" -map 1:a \
  -c:v libx264 -preset fast -crf 20 \
  -c:a aac -b:a 192k \
  -shortest \
  ENRIQUE_SUPERBOT007_V2_FINAL.mp4 2>/dev/null

final_dur=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 ENRIQUE_SUPERBOT007_V2_FINAL.mp4)
final_size=$(du -sh ENRIQUE_SUPERBOT007_V2_FINAL.mp4 | cut -f1)
echo ""
echo "✅ FINAL VIDEO LISTO!"
echo "   Duración: ${final_dur}s"
echo "   Tamaño:   ${final_size}"
echo "   Archivo:  ENRIQUE_SUPERBOT007_V2_FINAL.mp4"
