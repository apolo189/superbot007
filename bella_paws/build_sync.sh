#!/bin/bash
set -e

DIR="/home/user/webapp/bella_paws"
SCREENS="$DIR/screens"
LANDING="$DIR/landing_screens"
AUDIO="$DIR/sync_audio"
OUT="$DIR/sync_clips"
MUSIC="/home/user/webapp/enrique_v2/musica.mp3"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FINAL="$DIR/SUPERBOT007_SYNC_FINAL.mp4"

mkdir -p "$OUT"
rm -f "$OUT"/*.mp4

echo "=== SUPERBOT007 SYNC VIDEO - Screen duration = Audio duration ==="
echo ""

# Function: build one synced clip
# Args: clip_number, image_path, audio_path, label_text, zoom_direction
make_synced_clip() {
  local NUM="$1"
  local IMG="$2"
  local AUD="$3"
  local LABEL="$4"
  local ZDIR="${5:-in}"
  local OUTFILE="$OUT/clip_${NUM}.mp4"

  # Get exact audio duration
  local DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUD")
  echo "Clip $NUM | ${DUR}s | $LABEL"

  # zoom formula
  if [ "$ZDIR" = "out" ]; then
    ZOOM="zoom='if(lte(on,1),1.2,max(1.0,1.2-(on-1)*(0.2/(${DUR}*25-1))))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
  else
    ZOOM="zoom='min(1.2,1.0+on*(0.2/(${DUR}*25)))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
  fi

  # Step 1: image → video (silent), exact duration
  ffmpeg -y -loop 1 -i "$IMG" \
    -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,zoompan=${ZOOM}:d=${DUR}*25:s=1280x720:fps=25,drawtext=fontfile=${FONT}:text='${LABEL}':fontsize=32:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=10:x=(w-text_w)/2:y=h-th-20" \
    -t "$DUR" -r 25 -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p \
    "$OUT/video_${NUM}_silent.mp4" 2>/dev/null

  # Step 2: mix narration + soft music at exact duration
  ffmpeg -y \
    -i "$AUD" \
    -i "$MUSIC" \
    -filter_complex "[0:a]volume=1.0[narr];[1:a]volume=0.08,atrim=0:${DUR}[bg];[narr][bg]amix=inputs=2:duration=first[aout]" \
    -map "[aout]" -t "$DUR" -ar 44100 -b:a 192k \
    "$OUT/audio_${NUM}_mix.mp3" 2>/dev/null

  # Step 3: combine video + audio
  ffmpeg -y \
    -i "$OUT/video_${NUM}_silent.mp4" \
    -i "$OUT/audio_${NUM}_mix.mp3" \
    -map 0:v -map 1:a \
    -c:v copy -c:a aac -b:a 192k \
    -shortest \
    "$OUTFILE" 2>/dev/null

  echo "  -> $(basename $OUTFILE) done ($(du -sh $OUTFILE | cut -f1))"
}

# =============================================
# CLIP 1: Empty form - intro
# =============================================
make_synced_clip "01" \
  "$SCREENS/02_form_lead_vacio.png" \
  "$AUDIO/s01_audio.mp3" \
  "Entra a SuperBot007.com y llena el formulario" \
  "in"

# =============================================
# CLIP 2: Form filled with personal/business info
# =============================================
make_synced_clip "02" \
  "$SCREENS/05_form_step1_llenado.png" \
  "$AUDIO/s02_audio.mp3" \
  "Nombre, correo, negocio, ciudad, descripcion" \
  "out"

# =============================================
# CLIP 3: Gallery with photos uploaded
# =============================================
make_synced_clip "03" \
  "$SCREENS/14_form_step5_galeria_llenada.png" \
  "$AUDIO/s03_audio.mp3" \
  "Subes tus fotos, servicios y horarios" \
  "in"

# =============================================
# CLIP 4: Activate Bot button
# =============================================
make_synced_clip "04" \
  "$SCREENS/19_form_step7_boton_activar.png" \
  "$AUDIO/s04_audio.mp3" \
  "Presiona ACTIVAR BOT 007" \
  "out"

# =============================================
# CLIP 5: Bot ready confirmation
# =============================================
make_synced_clip "05" \
  "$SCREENS/21_form_step8_bot_listo.png" \
  "$AUDIO/s05_audio.mp3" \
  "TU BOT ESTA LISTO - Landing + Chatbot + Tarjeta" \
  "in"

# =============================================
# CLIP 6: Landing page hero
# =============================================
make_synced_clip "06" \
  "$LANDING/01_landing_01_hero.png" \
  "$AUDIO/s06_audio.mp3" \
  "Tu Landing Page profesional - generada automaticamente" \
  "out"

# =============================================
# CLIP 7: Landing page services + gallery
# =============================================
make_synced_clip "07" \
  "$LANDING/04_landing_04_galeria.png" \
  "$AUDIO/s07_audio.mp3" \
  "Servicios, precios, galeria y contacto incluidos" \
  "in"

# =============================================
# CLIP 8: Chatbot responding
# =============================================
make_synced_clip "08" \
  "$LANDING/08_landing_08_chat_respuesta.png" \
  "$AUDIO/s08_audio.mp3" \
  "Chatbot responde solo 24/7 - sin que hagas nada" \
  "out"

# =============================================
# CLIP 9: Digital card
# =============================================
make_synced_clip "09" \
  "$LANDING/09_landing_09_tarjeta.png" \
  "$AUDIO/s09_audio.mp3" \
  "Tu tarjeta digital - WhatsApp, redes y direccion" \
  "in"

# =============================================
# CLIP 10: CTA final
# =============================================
make_synced_clip "10" \
  "$SCREENS/01_homepage.png" \
  "$AUDIO/s10_audio.mp3" \
  "Comenta BOT - Te mando el link GRATIS" \
  "out"

echo ""
echo "--- All 10 clips done. Concatenating ---"

# Build concat list
CONCAT="$OUT/concat.txt"
> "$CONCAT"
for i in 01 02 03 04 05 06 07 08 09 10; do
  echo "file '$OUT/clip_${i}.mp4'" >> "$CONCAT"
done

ffmpeg -y -f concat -safe 0 -i "$CONCAT" -c copy "$FINAL" 2>/dev/null

DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$FINAL")
SIZE=$(du -sh "$FINAL" | cut -f1)
echo ""
echo "==========================="
echo "FINAL VIDEO READY"
echo "File: $FINAL"
echo "Duration: ${DUR}s"
echo "Size: ${SIZE}"
echo "==========================="
