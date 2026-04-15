#!/bin/bash
set -e

DIR="/home/user/webapp/bella_paws"
SCREENS="$DIR/screens"
LANDING="$DIR/landing_screens"
OUT="$DIR"
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
NARRATION="$DIR/narracion_voz_correcta.mp3"
MUSIC="/home/user/webapp/enrique_v2/musica.mp3"
FINAL="$DIR/BELLA_PAWS_DEMO_V3_FINAL.mp4"

echo "=== BUILDING BELLA PAWS DEMO V3 ==="

# Clean old clips
rm -f "$OUT"/clip_v3_*.mp4 "$OUT"/video_raw_v3.mp4 "$OUT"/audio_v3_mix.mp3

# Helper: make clip with zoom effect + text overlay (no colons in text)
make_clip() {
  local img="$1"
  local dur="$2"
  local label="$3"
  local out="$4"
  local zoom_dir="${5:-in}"

  if [ "$zoom_dir" = "out" ]; then
    ZOOM_EXPR="zoom='if(lte(on,1),1.25,max(1.0,1.25-(on-1)*(0.25/(${dur}*25-1))))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
  else
    ZOOM_EXPR="zoom='min(1.25,1.0+on*(0.25/(${dur}*25)))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
  fi

  ffmpeg -y -loop 1 -i "$img" -vf \
    "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,zoompan=${ZOOM_EXPR}:d=${dur}*25:s=1280x720:fps=25,drawtext=fontfile=${FONT}:text='${label}':fontsize=34:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=10:x=(w-text_w)/2:y=h-th-25" \
    -t "$dur" -r 25 -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p \
    "$out" 2>/dev/null
  echo "  OK: $(basename $out) [${dur}s] - $label"
}

echo "--- FORM PROCESS ---"
make_clip "$SCREENS/01_homepage.png"                         1.5 "SuperBot007.com - Entra y crea tu bot"   "$OUT/clip_v3_01.mp4" in
make_clip "$SCREENS/02_form_lead_vacio.png"                  1.5 "Llena tus datos de contacto"             "$OUT/clip_v3_02.mp4" out
make_clip "$SCREENS/03_form_lead_llenado.png"                1.5 "Datos listos"                            "$OUT/clip_v3_03.mp4" in
make_clip "$SCREENS/05_form_step1_llenado.png"               1.5 "Nombre y tipo de negocio"                "$OUT/clip_v3_04.mp4" out
make_clip "$SCREENS/07_form_step2_diseno.png"                1.5 "Elige tus colores y diseno"              "$OUT/clip_v3_05.mp4" in
make_clip "$SCREENS/10_form_step3_servicios_llenados.png"    1.5 "Agrega tus servicios y precios"          "$OUT/clip_v3_06.mp4" out
make_clip "$SCREENS/14_form_step5_galeria_llenada.png"       1.5 "Sube tus fotos"                          "$OUT/clip_v3_07.mp4" in
make_clip "$SCREENS/16_form_step6_contacto_llenado.png"      1.5 "Tu contacto y horarios"                  "$OUT/clip_v3_08.mp4" out
make_clip "$SCREENS/18_form_step7_ia_generado.png"           1.5 "La IA genera tu contenido"               "$OUT/clip_v3_09.mp4" in
make_clip "$SCREENS/19_form_step7_boton_activar.png"         2.0 "Presiona ACTIVAR BOT 007"                "$OUT/clip_v3_10.mp4" out

echo "--- BOT LISTO ---"
make_clip "$SCREENS/21_form_step8_bot_listo.png"             2.5 "TU BOT ESTA LISTO"                       "$OUT/clip_v3_11.mp4" in
make_clip "$SCREENS/22_form_step8_success_top.png"           2.0 "Tu Landing + Chatbot + Tarjeta digital"  "$OUT/clip_v3_12.mp4" out

echo "--- LANDING PAGE GENERADO ---"
make_clip "$LANDING/01_landing_01_hero.png"                  3.5 "Tu Landing Page - Generada automaticamente" "$OUT/clip_v3_13.mp4" in
make_clip "$LANDING/02_landing_02_servicios.png"             3.0 "Tus servicios y precios"                 "$OUT/clip_v3_14.mp4" out
make_clip "$LANDING/04_landing_04_galeria.png"               3.0 "Tu galeria de fotos"                     "$OUT/clip_v3_15.mp4" in
make_clip "$LANDING/06_landing_06_chat_abierto.png"          3.0 "Chatbot que responde solo 24 horas"      "$OUT/clip_v3_16.mp4" out
make_clip "$LANDING/08_landing_08_chat_respuesta.png"        3.0 "Respuestas automaticas e inmediatas"     "$OUT/clip_v3_17.mp4" in
make_clip "$LANDING/09_landing_09_tarjeta.png"               3.0 "Tu tarjeta digital incluida"             "$OUT/clip_v3_18.mp4" out
make_clip "$LANDING/10_landing_10_tarjeta2.png"              2.5 "WhatsApp - Redes - Direccion"            "$OUT/clip_v3_19.mp4" in

echo "--- CTA FINAL ---"
make_clip "$SCREENS/01_homepage.png"                         3.0 "Comenta BOT y te mando el link GRATIS"   "$OUT/clip_v3_20.mp4" in

echo ""
echo "--- Concatenating ---"
# Build concat list dynamically
CONCAT_FILE="$OUT/concat_v3.txt"
> "$CONCAT_FILE"
for i in $(seq -w 1 20); do
  f="$OUT/clip_v3_${i}.mp4"
  if [ -f "$f" ] && [ -s "$f" ]; then
    echo "file '$f'" >> "$CONCAT_FILE"
  fi
done
cat "$CONCAT_FILE"

ffmpeg -y -f concat -safe 0 -i "$CONCAT_FILE" -c copy "$OUT/video_raw_v3.mp4" 2>/dev/null
VID_DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$OUT/video_raw_v3.mp4")
echo "Raw video: ${VID_DUR}s"

echo "--- Mixing audio ---"
ffmpeg -y \
  -i "$NARRATION" \
  -i "$MUSIC" \
  -filter_complex "[0:a]volume=1.0[narr];[1:a]volume=0.10,atrim=0:60[music];[narr][music]amix=inputs=2:duration=first:dropout_transition=2[aout]" \
  -map "[aout]" \
  -ar 44100 -b:a 192k \
  "$OUT/audio_v3_mix.mp3" 2>/dev/null
echo "Audio mix done"

echo "--- Final render ---"
ffmpeg -y \
  -i "$OUT/video_raw_v3.mp4" \
  -i "$OUT/audio_v3_mix.mp3" \
  -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 192k \
  -shortest \
  "$FINAL" 2>/dev/null

FINAL_DUR=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$FINAL")
FINAL_SIZE=$(du -sh "$FINAL" | cut -f1)
echo ""
echo "=== DONE ==="
echo "Duration: ${FINAL_DUR}s | Size: ${FINAL_SIZE}"
echo "File: $FINAL"
