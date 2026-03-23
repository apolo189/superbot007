#!/bin/bash
# ══════════════════════════════════════════════
#  SuperBot007 Theme Switcher
#  Usage:
#    ./theme-switcher.sh original   → reverts to dark orange
#    ./theme-switcher.sh guru       → applies Guru Pro (orange→magenta)
# ══════════════════════════════════════════════

FILE="/home/user/webapp/salespage.html"

THEME_ORIGINAL=':root{
  --orange:#f24207;
  --o2:#ff6a00;
  --grad:linear-gradient(135deg,#f24207,#ff6a00);
  --green:#00c853;
  --gold:#ffd700;
  --dark:#000000;
  --card:#000000;
  --bd:rgba(242,66,7,0.18);
  --mu:#ffffff;
  --txt:#ffffff;
}'

THEME_GURU=':root{
  --orange:#ff4500;
  --o2:#ff0099;
  --grad:linear-gradient(135deg,#ff4500,#ff0099);
  --green:#00ff88;
  --gold:#ffcc00;
  --dark:#0a0a0f;
  --card:#12121a;
  --bd:rgba(255,0,153,0.25);
  --mu:#f0f0ff;
  --txt:#ffffff;
  --accent:#8b5cf6;
}'

case "$1" in
  original)
    # Replace :root block with original
    python3 - "$FILE" << 'PY'
import sys, re
f = open(sys.argv[1], 'r')
content = f.read()
f.close()
new_root = """:root{
  --orange:#f24207;
  --o2:#ff6a00;
  --grad:linear-gradient(135deg,#f24207,#ff6a00);
  --green:#00c853;
  --gold:#ffd700;
  --dark:#000000;
  --card:#000000;
  --bd:rgba(242,66,7,0.18);
  --mu:#ffffff;
  --txt:#ffffff;
}"""
content = re.sub(r':root\{[^}]+\}', new_root, content, count=1)
open(sys.argv[1], 'w').write(content)
print("✅ Theme ORIGINAL applied — dark orange")
PY
    ;;
  guru)
    python3 - "$FILE" << 'PY'
import sys, re
f = open(sys.argv[1], 'r')
content = f.read()
f.close()
new_root = """:root{
  --orange:#ff4500;
  --o2:#ff0099;
  --grad:linear-gradient(135deg,#ff4500,#ff0099);
  --green:#00ff88;
  --gold:#ffcc00;
  --dark:#0a0a0f;
  --card:#12121a;
  --bd:rgba(255,0,153,0.25);
  --mu:#f0f0ff;
  --txt:#ffffff;
  --accent:#8b5cf6;
}"""
content = re.sub(r':root\{[^}]+\}', new_root, content, count=1)
open(sys.argv[1], 'w').write(content)
print("✅ Theme GURU PRO applied — orange→magenta")
PY
    ;;
  *)
    echo "Usage: $0 [original|guru]"
    echo ""
    echo "  original  → Dark Orange theme (current/safe)"
    echo "  guru      → Guru Pro theme (orange→magenta)"
    ;;
esac
