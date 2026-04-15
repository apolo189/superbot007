#!/bin/bash
set -e

DIR="/home/user/webapp/bella_paws"
SCREENS="$DIR/screens"
GOOD="$DIR/good_screens"
AUDIO="$DIR/v3_audio"
CLIPS="$DIR/v4_clips"
MUSIC="/home/user/webapp/enrique_v2/musica.mp3"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FINAL="$DIR/SUPERBOT007_FINAL_V5.mp4"

mkdir -p "$CLIPS"
rm -f "$CLIPS"/*.mp4 "$CLIPS"/*.mp3

echo "=== SUPERBOT007 FINAL V5 ==="
echo "Voice: ZEBslWM12xCQWILoQtiP (elevenlabs/v3-tts)"
echo "No zoom - simple slides - real landing page screenshots"
echo ""

make_clip() {
  local NUM="$1"
  local IMG="$2"
  local AUD="$3"
  local LABEL="$4"
  local OUT="$CLIPS/clip_${NUM}.mp4"

  local DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUD")
  printf "Clip %s | %.1fs | %s\n" "$NUM" "$DUR" "$LABEL"

  # Simple static slide - scale to 1280x720, black bars if needed
  ffmpeg -y -loop 1 -i "$IMG" \
    -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,drawtext=fontfile=${FONT}:text='${LABEL}':fontsize=28:fontcolor=white:box=1:boxcolor=black@0.75:boxborderw=10:x=(w-text_w)/2:y=h-th-18" \
    -t "$DUR" -r 25 -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p \
    "$CLIPS/v_${NUM}.mp4" 2>/dev/null

  # Mix narration + soft music
  ffmpeg -y \
    -i "$AUD" -i "$MUSIC" \
    -filter_complex "[0:a]volume=1.0[n];[1:a]volume=0.07,atrim=0:${DUR}[m];[n][m]amix=inputs=2:duration=first[a]" \
    -map "[a]" -t "$DUR" -ar 44100 -b:a 192k \
    "$CLIPS/a_${NUM}.mp3" 2>/dev/null

  ffmpeg -y -i "$CLIPS/v_${NUM}.mp4" -i "$CLIPS/a_${NUM}.mp3" \
    -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest \
    "$OUT" 2>/dev/null

  echo "  -> OK ($(du -sh $OUT | cut -f1))"
}

# CLIP 1: Empty form
make_clip "01" "$SCREENS/02_form_lead_vacio.png"          "$AUDIO/s01.mp3" "Entra a SuperBot007.com - llena el formulario"

# CLIP 2: Business info filled
make_clip "02" "$SCREENS/05_form_step1_llenado.png"       "$AUDIO/s02.mp3" "Nombre, negocio, ciudad, descripcion"

# CLIP 3: Gallery/photos filled
make_clip "03" "$SCREENS/14_form_step5_galeria_llenada.png" "$AUDIO/s03.mp3" "Sube tus fotos y agrega tus servicios"

# CLIP 4: Activate bot button
make_clip "04" "$SCREENS/19_form_step7_boton_activar.png"  "$AUDIO/s04.mp3" "Presiona ACTIVAR BOT 007"

# CLIP 5: Bot ready screen
make_clip "05" "$SCREENS/21_form_step8_bot_listo.png"     "$AUDIO/s05.mp3" "TU BOT ESTA LISTO"

# CLIP 6: LANDING PAGE - Hero section (real screenshot after load)
make_clip "06" "$GOOD/landing_s1_hero.png"                "$AUDIO/s06.mp3" "Tu Landing Page profesional - automatica"

# CLIP 7: LANDING PAGE - Services section
make_clip "07" "$GOOD/landing_s2_services.png"            "$AUDIO/s07.mp3" "Servicios, precios, galeria y contacto"

# CLIP 8: LANDING PAGE - Gallery
make_clip "08" "$GOOD/landing_s3_gallery.png"             "$AUDIO/s08.mp3" "Chatbot responde solo 24 horas 7 dias"

# CLIP 9: Digital card
make_clip "09" "$GOOD/card_top.png"                       "$AUDIO/s09.mp3" "Tu tarjeta digital lista para compartir"

# CLIP 10: CTA final - homepage
make_clip "10" "$SCREENS/01_homepage.png"                 "$AUDIO/s10.mp3" "Comenta BOT - link GRATIS"

echo ""
echo "--- Concatenating ---"
CONCAT="$CLIPS/concat.txt"
> "$CONCAT"
for i in 01 02 03 04 05 06 07 08 09 10; do
  echo "file '$CLIPS/clip_${i}.mp4'" >> "$CONCAT"
done

ffmpeg -y -f concat -safe 0 -i "$CONCAT" -c copy "$FINAL" 2>/dev/null

DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$FINAL")
SIZE=$(du -sh "$FINAL" | cut -f1)
echo ""
echo "=============================="
echo "DONE: $FINAL"
echo "Duration: ${DUR}s | Size: $SIZE"
echo "=============================="
