#!/usr/bin/env python3
import subprocess, os, sys

DIR = "/home/user/webapp/bella_paws"
SCREENS = f"{DIR}/screens"
NARR = f"{DIR}/narracion_demo_v2.mp3"
MUSIC = "/home/user/webapp/enrique_v2/musica.mp3"
OUT = f"{DIR}/BELLA_PAWS_DEMO_FINAL.mp4"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
W, H = 1280, 720

# (file, title, subtitle, zoom_direction, duration_seconds)
SHOTS = [
    ("01_homepage.png",              "SuperBot007.com",             "Tu negocio en piloto automatico", "in",  3.0),
    ("02_form_lead_vacio.png",       "Entra al formulario",         "Rapido y sencillo",               "in",  2.0),
    ("03_form_lead_llenado.png",     "Tu nombre y email",           "Listo en segundos",               "out", 2.0),
    ("04_form_step1_negocio.png",    "Datos del negocio",           "Nombre, ciudad y tipo",           "in",  2.0),
    ("05_form_step1_llenado.png",    "Bella Paws Spa - Miami FL",   "Descripcion y bienvenida",        "out", 2.5),
    ("06_form_step1_con_logo.png",   "Sube tu logo",                "Tu imagen de marca",              "in",  2.0),
    ("08_form_step2_colores_imagenes.png", "Diseno y colores",      "Personaliza tu estilo",           "in",  2.0),
    ("10_form_step3_servicios_llenados.png", "Tus servicios",       "Con precios e imagenes",          "out", 2.5),
    ("12_form_step4_pagos_productos.png", "Pagos y productos",      "PayPal, Venmo y mas",             "in",  2.0),
    ("14_form_step5_galeria_llenada.png", "Tu galeria de fotos",    "Las mejores imagenes",            "out", 2.0),
    ("16_form_step6_contacto_llenado.png", "Contacto y horarios",  "WhatsApp e Instagram",            "in",  2.0),
    ("19_form_step7_boton_activar.png",   "Listo para activar",    "Un solo click",                   "in",  2.0),
    ("21_form_step8_bot_listo.png",  "TU BOT ESTA LISTO",          "En menos de 10 minutos",          "out", 3.5),
    ("24_landing_hero.png",          "Landing page profesional",    "Generada automaticamente",        "in",  3.0),
    ("26_landing_productos.png",     "Servicios y productos",       "Todo organizado",                 "out", 2.5),
    ("28_chatbot_abierto.png",       "El chatbot responde SOLO",    "24 horas - 7 dias",               "in",  3.0),
    ("30_tarjeta_top.png",           "Tu tarjeta digital incluida", "Comparte en 1 click",             "out", 2.5),
    ("32_cta_final.png",             'Comenta "BOT" ahora',         "Link GRATIS - SuperBot007.com",   "in",  4.0),
]

def get_duration(f):
    r = subprocess.run(["ffprobe","-v","quiet","-show_entries","format=duration","-of","csv=p=0",f], capture_output=True, text=True)
    return float(r.stdout.strip()) if r.stdout.strip() else 0

def make_clip(img_path, title, subtitle, zoom_dir, dur, out_path):
    frames = int(dur * 25)
    if zoom_dir == "in":
        zoom_expr = "min(zoom+0.0015,1.3)"
        x_expr = "iw/2-(iw/zoom/2)"
        y_expr = "ih/2-(ih/zoom/2)"
    else:
        zoom_expr = "if(lte(zoom,1.0),1.3,max(1.0,zoom-0.0015))"
        x_expr = "iw/2-(iw/zoom/2)"
        y_expr = "ih/2-(ih/zoom/2)"

    # Escape special chars for drawtext
    title_esc = title.replace("'", "\\'").replace(":", "\\:")
    subtitle_esc = subtitle.replace("'", "\\'").replace(":", "\\:")

    vf = (
        f"zoompan=z='{zoom_expr}':x='{x_expr}':y='{y_expr}':d={frames}:s={W}x{H}:fps=25,"
        f"drawtext=fontfile={FONT}:text='{title_esc}':fontsize=38:fontcolor=white:"
        f"x=(w-text_w)/2:y=610:box=1:boxcolor=0x000000@0.8:boxborderw=16,"
        f"drawtext=fontfile={FONT_REG}:text='{subtitle_esc}':fontsize=24:fontcolor=0xFFD700:"
        f"x=(w-text_w)/2:y=660:box=1:boxcolor=0x000000@0.7:boxborderw=10"
    )

    cmd = [
        "ffmpeg", "-y", "-loop", "1", "-i", img_path,
        "-vf", vf,
        "-t", str(dur), "-r", "25", "-c:v", "libx264",
        "-preset", "fast", "-crf", "22", "-pix_fmt", "yuv420p", "-an",
        out_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    size = os.path.getsize(out_path) if os.path.exists(out_path) else 0
    return size > 0, result.stderr[-200:] if result.returncode != 0 else ""

print("=== BUILDING BELLA PAWS DEMO VIDEO ===")
print(f"18 clips | zoom in/out | narration 41s | target ~55s\n")

print("Step 1: Creating clips with zoom effects...")
clip_files = []
for i, (fname, title, subtitle, zoom, dur) in enumerate(SHOTS):
    img = f"{SCREENS}/{fname}"
    clip = f"{DIR}/vclip_{i:02d}.mp4"
    ok, err = make_clip(img, title, subtitle, zoom, dur, clip)
    status = "✅" if ok else "❌"
    print(f"  {status} clip_{i:02d} [{zoom} {dur}s] {title}")
    if not ok:
        print(f"     Error: {err}")
        sys.exit(1)
    clip_files.append(clip)

print(f"\nStep 2: Concatenating {len(clip_files)} clips...")
concat_file = f"{DIR}/concat_final.txt"
with open(concat_file, "w") as f:
    for cf in clip_files:
        f.write(f"file '{cf}'\n")

raw_video = f"{DIR}/video_raw_final.mp4"
subprocess.run([
    "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", concat_file,
    "-c:v", "libx264", "-preset", "fast", "-crf", "22", "-pix_fmt", "yuv420p",
    raw_video
], capture_output=True)

vid_dur = get_duration(raw_video)
print(f"  Video: {vid_dur:.1f}s")

print("\nStep 3: Mixing audio (narration + soft music 12%)...")
audio_mix = f"{DIR}/audio_final_mix.mp3"
subprocess.run([
    "ffmpeg", "-y",
    "-i", NARR, "-i", MUSIC,
    "-filter_complex",
    f"[1:a]volume=0.12,atrim=0:{vid_dur},asetpts=PTS-STARTPTS[music];"
    f"[0:a]apad=pad_dur=15[narr];"
    f"[narr][music]amix=inputs=2:duration=longest:dropout_transition=2[aout]",
    "-map", "[aout]", "-ar", "44100", "-ac", "2", "-b:a", "192k",
    audio_mix
], capture_output=True)
mix_dur = get_duration(audio_mix)
print(f"  Audio: {mix_dur:.1f}s")

print("\nStep 4: Final combine...")
subprocess.run([
    "ffmpeg", "-y",
    "-i", raw_video, "-i", audio_mix,
    "-map", "0:v", "-map", "1:a",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
    "-shortest", OUT
], capture_output=True)

final_dur = get_duration(OUT)
final_size = os.path.getsize(OUT) / (1024*1024)
print(f"\n=========================================")
print(f"✅ DONE: BELLA_PAWS_DEMO_FINAL.mp4")
print(f"Duration: {final_dur:.1f}s | Size: {final_size:.1f} MB")
print(f"=========================================")
