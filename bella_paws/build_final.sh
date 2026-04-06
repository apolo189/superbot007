#!/bin/bash
set -e

DIR="/home/user/webapp/bella_paws"
SCREENS="$DIR/screens"
LANDING="$DIR/fullpage_screens"
AUDIO="$DIR/v3_audio"
CLIPS="$DIR/final_clips"
MUSIC="/home/user/webapp/enrique_v2/musica.mp3"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FINAL="$DIR/SUPERBOT007_FINAL_V4.mp4"

mkdir -p "$CLIPS"
rm -f "$CLIPS"/*.mp4

echo "=== SUPERBOT007 FINAL V4 - Una voz, sin zoom, landing page completo ==="
echo ""

# Build one synced clip: image shown for EXACTLY the duration of its audio
# No zoom - simple static slide with subtle pan if tall image
make_clip() {
  local NUM="$1"
  local IMG="$2"
  local AUD="$3"
  local LABEL="$4"
  local OUT="$CLIPS/clip_${NUM}.mp4"

  local DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUD")
  echo "Clip $NUM | ${DUR}s | $LABEL"

  # Get image dimensions
  local W=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=noprint_wrappers=1:nokey=1 "$IMG" 2>/dev/null || identify -format "%w" "$IMG" 2>/dev/null || echo "1280")
  local H=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=noprint_wrappers=1:nokey=1 "$IMG" 2>/dev/null || identify -format "%h" "$IMG" 2>/dev/null || echo "720")

  # For tall images (full page screenshots): slow scroll from top to bottom
  # For normal images: just scale and pad, static
  local RATIO=$(echo "$H $W" | awk '{printf "%.2f", $1/$2}')
  local IS_TALL=$(echo "$RATIO" | awk '{print ($1 > 1.5) ? "yes" : "no"}')

  local FRAMES=$(echo "$DUR" | awk '{printf "%d", $1 * 25}')

  if [ "$IS_TALL" = "yes" ]; then
    # Scale to 1280 wide, then scroll from top to bottom over the duration
    # scaled height will be > 720
    local SCALED_H=$(echo "$H $W" | awk '{printf "%d", ($1/$2)*1280}')
    # Make sure scaled_h is even
    SCALED_H=$(( (SCALED_H / 2) * 2 ))
    local MAX_Y=$(( SCALED_H - 720 ))
    if [ $MAX_Y -lt 0 ]; then MAX_Y=0; fi

    ffmpeg -y -loop 1 -i "$IMG" \
      -vf "scale=1280:${SCALED_H},crop=1280:720:0:'if(lte(n,5),0,min(${MAX_Y},trunc((n-5)*${MAX_Y}/(${FRAMES}-10))))',drawtext=fontfile=${FONT}:text='${LABEL}':fontsize=30:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=8:x=(w-text_w)/2:y=h-th-20" \
      -t "$DUR" -r 25 -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p \
      "$CLIPS/video_${NUM}_silent.mp4" 2>/dev/null
  else
    # Normal image - scale to fit 1280x720, add black bars if needed
    ffmpeg -y -loop 1 -i "$IMG" \
      -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,drawtext=fontfile=${FONT}:text='${LABEL}':fontsize=30:fontcolor=white:box=1:boxcolor=black@0.7:boxborderw=8:x=(w-text_w)/2:y=h-th-20" \
      -t "$DUR" -r 25 -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p \
      "$CLIPS/video_${NUM}_silent.mp4" 2>/dev/null
  fi

  # Mix narration + soft background music
  ffmpeg -y \
    -i "$AUD" \
    -i "$MUSIC" \
    -filter_complex "[0:a]volume=1.0[narr];[1:a]volume=0.08,atrim=0:${DUR}[bg];[narr][bg]amix=inputs=2:duration=first[aout]" \
    -map "[aout]" -t "$DUR" -ar 44100 -b:a 192k \
    "$CLIPS/audio_${NUM}.mp3" 2>/dev/null

  # Combine
  ffmpeg -y \
    -i "$CLIPS/video_${NUM}_silent.mp4" \
    -i "$CLIPS/audio_${NUM}.mp3" \
    -map 0:v -map 1:a \
    -c:v copy -c:a aac -b:a 192k -shortest \
    "$OUT" 2>/dev/null

  echo "  -> clip_${NUM}.mp4 OK ($(du -sh $OUT | cut -f1))"
}

# ============ CLIP 1: Homepage + empty form ============
make_clip "01" \
  "$SCREENS/02_form_lead_vacio.png" \
  "$AUDIO/s01.mp3" \
  "Entra a SuperBot007.com y llena el formulario"

# ============ CLIP 2: Form with business data filled ============
make_clip "02" \
  "$SCREENS/05_form_step1_llenado.png" \
  "$AUDIO/s02.mp3" \
  "Nombre, correo, negocio, ciudad, descripcion"

# ============ CLIP 3: Gallery with photos ============
make_clip "03" \
  "$SCREENS/14_form_step5_galeria_llenada.png" \
  "$AUDIO/s03.mp3" \
  "Sube tus fotos, servicios y horarios"

# ============ CLIP 4: Activate bot button ============
make_clip "04" \
  "$SCREENS/19_form_step7_boton_activar.png" \
  "$AUDIO/s04.mp3" \
  "Presiona ACTIVAR BOT 007"

# ============ CLIP 5: Bot ready ============
make_clip "05" \
  "$SCREENS/21_form_step8_bot_listo.png" \
  "$AUDIO/s05.mp3" \
  "TU BOT ESTA LISTO - Landing + Chatbot + Tarjeta"

# ============ CLIP 6: Landing page HERO - full page scroll ============
make_clip "06" \
  "$LANDING/06a_hero.png" \
  "$AUDIO/s06.mp3" \
  "Tu Landing Page - generada automaticamente"

# ============ CLIP 7: Landing page services + gallery - full scroll ============
make_clip "07" \
  "$LANDING/06b_services.png" \
  "$AUDIO/s07.mp3" \
  "Servicios, precios, galeria y contacto"

# ============ CLIP 8: Chatbot ============
make_clip "08" \
  "$LANDING/06c_gallery.png" \
  "$AUDIO/s08.mp3" \
  "Chatbot responde solo 24 horas 7 dias"

# ============ CLIP 9: Digital card ============
make_clip "09" \
  "$LANDING/09_card_fullpage.png" \
  "$AUDIO/s09.mp3" \
  "Tu tarjeta digital - WhatsApp, redes y direccion"

# ============ CLIP 10: CTA ============
make_clip "10" \
  "$SCREENS/01_homepage.png" \
  "$AUDIO/s10.mp3" \
  "Comenta BOT y te mando el link GRATIS"

echo ""
echo "--- Concatenating all 10 clips ---"
CONCAT="$CLIPS/concat.txt"
> "$CONCAT"
for i in 01 02 03 04 05 06 07 08 09 10; do
  echo "file '$CLIPS/clip_${i}.mp4'" >> "$CONCAT"
done

ffmpeg -y -f concat -safe 0 -i "$CONCAT" -c copy "$FINAL" 2>/dev/null

DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$FINAL")
SIZE=$(du -sh "$FINAL" | cut -f1)
echo ""
echo "================================"
echo "DONE: $FINAL"
echo "Duration: ${DUR}s | Size: ${SIZE}"
echo "================================"
