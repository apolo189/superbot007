#!/bin/bash
# ===========================================
# SUPERBOT007 VIDEO V7
# 9 clips, voice ZEBslWM12xCQWILoQtiP
# New script: urgency of RESULT / NEED
# No zoom, simple slides
# ===========================================

set -e
cd /home/user/webapp/bella_paws

SCREENS="v7_screens"
AUDIO="v7_audio"
CLIPS="v7_clips"
OUT="SUPERBOT007_FINAL_V7.mp4"

mkdir -p "$CLIPS"

echo "=== BUILDING V7 ==="

# Get durations
D01=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$AUDIO/s01.mp3")
D02=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$AUDIO/s02.mp3")
D03=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$AUDIO/s03.mp3")
D04=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$AUDIO/s04.mp3")
D05=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$AUDIO/s05.mp3")
D06=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$AUDIO/s06.mp3")
D07=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$AUDIO/s07.mp3")
D08=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$AUDIO/s08.mp3")
D09=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$AUDIO/s09.mp3")

echo "Durations: s01=$D01 s02=$D02 s03=$D03 s04=$D04 s05=$D05 s06=$D06 s07=$D07 s08=$D08 s09=$D09"

# Function: make slide clip (image + audio, image scales to fill 1080x1920 with top crop)
make_clip() {
  local num=$1
  local img=$2
  local audio=$3
  local dur=$4
  local out="$CLIPS/clip${num}.mp4"

  echo "Clip $num: $img -> $out (${dur}s)"

  ffmpeg -y -loop 1 -framerate 25 -t "$dur" \
    -i "$img" \
    -i "$audio" \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:0:0,setsar=1" \
    -c:v libx264 -preset fast -crf 22 \
    -c:a aac -b:a 128k \
    -pix_fmt yuv420p \
    -shortest \
    -movflags +faststart \
    "$out" -loglevel error
  echo "  -> OK $(du -h $out | cut -f1)"
}

# CLIP 01 - SuperBot007 homepage (HOOK: "¿Quieres vender online y no tienes página web?")
make_clip "01" "$SCREENS/home_hero.png" "$AUDIO/s01.mp3" "$D01"

# CLIP 02 - Homepage features / what you get ("SuperBot007 te da página web, chatbot y tarjeta digital")
make_clip "02" "$SCREENS/home_features.png" "$AUDIO/s02.mp3" "$D02"

# CLIP 03 - Empty form ("Entras a SuperBot007.com, llenas el formulario con los datos de tu negocio")
make_clip "03" "$SCREENS/form_empty.png" "$AUDIO/s03.mp3" "$D03"

# CLIP 04 - Form with data / step1 filled ("Presionas Activar Bot 007. ¡Un solo click!")
make_clip "04" "$SCREENS/form_step1.png" "$AUDIO/s04.mp3" "$D04"

# CLIP 05 - Bot ready screen ("Tu Bot está listo. Con tres links listos para usar")
make_clip "05" "$SCREENS/bot_ready.png" "$AUDIO/s05.mp3" "$D05"

# CLIP 06 - Landing page HERO ("Tu página web profesional, lista para recibir clientes")
make_clip "06" "$SCREENS/landing_hero.png" "$AUDIO/s06.mp3" "$D06"

# CLIP 07 - Landing page SERVICES ("Tus servicios con precios, galería, contacto")
make_clip "07" "$SCREENS/landing_services.png" "$AUDIO/s07.mp3" "$D07"

# CLIP 08 - CHATBOT responding ("El chatbot responde solo, 24/7")
make_clip "08" "$SCREENS/chatbot.png" "$AUDIO/s08.mp3" "$D08"

# CLIP 09 - Digital CARD + final CTA ("¡Todo esto en menos de diez minutos! Comenta BOT")
make_clip "09" "$SCREENS/card.png" "$AUDIO/s09.mp3" "$D09"

echo "=== CONCATENATING ALL CLIPS ==="

# Build concat list
cat > "$CLIPS/concat.txt" << 'EOF'
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

ffmpeg -y -f concat -safe 0 -i "$CLIPS/concat.txt" \
  -c copy "$OUT" -loglevel error

echo "=== DONE ==="
DURATION=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUT")
SIZE=$(du -h "$OUT" | cut -f1)
echo "Final video: $OUT"
echo "Duration: ${DURATION}s | Size: $SIZE"
