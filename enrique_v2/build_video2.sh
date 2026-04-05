#!/bin/bash
set -e

SRC_DUR=5.042

echo "=== STRETCHING 9 ESCENAS ==="

stretch_scene() {
  local scene=$1
  local target=$2
  # Use python for float division
  local pts=$(python3 -c "print(f'{$target/$SRC_DUR:.6f}')")
  echo "  $scene → ${target}s (pts=${pts})"
  ffmpeg -y -i "${scene}.mp4" \
    -filter_complex "[0:v]setpts=${pts}*PTS[v]" \
    -map "[v]" \
    -c:v libx264 -preset fast -crf 20 \
    "${scene}_long.mp4" 2>/dev/null
}

stretch_scene s1_compra 19
stretch_scene s2_opening 17
stretch_scene s3_bills 17
stretch_scene s4_landlord 17
stretch_scene s5_caos 18
stretch_scene s6_cliente 17
stretch_scene s7_descubrimiento 22
stretch_scene s8_exito 25
stretch_scene s9_cta 23

echo ""
echo "=== CONCATENANDO VIDEO ==="

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

VID_DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 video_sin_audio.mp4)
echo "Video concatenado: ${VID_DUR}s"

echo ""
echo "=== MEZCLANDO AUDIO ==="

ffmpeg -y \
  -i narracion.mp3 \
  -i musica.mp3 \
  -filter_complex "[0:a]volume=1.0[narr];[1:a]volume=0.18[mus];[narr][mus]amix=inputs=2:duration=first:dropout_transition=2[aout]" \
  -map "[aout]" \
  -t "${VID_DUR}" \
  audio_mix.mp3 2>/dev/null
echo "Audio mezclado OK"

echo ""
echo "=== VIDEO FINAL CON CTA ==="

ffmpeg -y \
  -i video_sin_audio.mp4 \
  -i audio_mix.mp3 \
  -filter_complex \
    "[0:v]drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='SuperBot007.com':fontsize=54:fontcolor=white:x=(w-text_w)/2:y=h-110:box=1:boxcolor=0x000033@0.85:boxborderw=18:enable='between(t,152,175)',drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='Crea tu Bot y Landing Page HOY':fontsize=34:fontcolor=0xFFD700:x=(w-text_w)/2:y=h-55:box=1:boxcolor=0x000033@0.85:boxborderw=12:enable='between(t,154,175)'[vout]" \
  -map "[vout]" -map 1:a \
  -c:v libx264 -preset fast -crf 20 \
  -c:a aac -b:a 192k \
  -shortest \
  ENRIQUE_SUPERBOT007_V2_FINAL.mp4 2>/dev/null

FINAL_DUR=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 ENRIQUE_SUPERBOT007_V2_FINAL.mp4)
FINAL_SIZE=$(du -sh ENRIQUE_SUPERBOT007_V2_FINAL.mp4 | cut -f1)

echo ""
echo "✅ VIDEO FINAL COMPLETADO!"
echo "   Duración: ${FINAL_DUR}s (~$(python3 -c "print(f'{$FINAL_DUR/60:.1f}')") min)"
echo "   Tamaño:   ${FINAL_SIZE}"
echo "   Archivo:  ENRIQUE_SUPERBOT007_V2_FINAL.mp4"
