#!/usr/bin/env bash
# Rebuilds the three self-hosted fonts in public/fonts/ from Google Fonts' sources (all OFL).
# The outputs are committed; run this only to change a font or its subset.
#   Archivo   -> one static instance, 62% width, weight 900 (display), Latin
#   Manrope   -> variable, weight axis limited to 400-800 (body), Latin
#   Noto Sans Bengali -> weight 900, only the taka sign (U+09F3)
set -euo pipefail

OUT="$(cd "$(dirname "$0")/../.." && pwd)/public/fonts"
WORK="${FONT_WORK:-$(mktemp -d)}"
RAW=https://raw.githubusercontent.com/google/fonts/main/ofl
LATIN="U+0000-00FF,U+2018-201F,U+2026,U+2032-2033,U+20AC,U+2190-2193"

python3 -m venv "$WORK/venv"
"$WORK/venv/bin/pip" install --quiet fonttools brotli
PY="$WORK/venv/bin/python"
SUBSET="$WORK/venv/bin/pyftsubset"

fetch() { curl -fsSL --max-time 60 -o "$WORK/$2" "$RAW/$1"; }
fetch 'archivo/Archivo%5Bwdth,wght%5D.ttf' archivo.ttf
fetch 'manrope/Manrope%5Bwght%5D.ttf' manrope.ttf
fetch 'notosansbengali/NotoSansBengali%5Bwdth,wght%5D.ttf' bengali.ttf
fetch 'archivo/OFL.txt' archivo-OFL.txt
fetch 'manrope/OFL.txt' manrope-OFL.txt
fetch 'notosansbengali/OFL.txt' bengali-OFL.txt

"$PY" -m fontTools.varLib.instancer "$WORK/archivo.ttf" wdth=62 wght=900 --static -o "$WORK/archivo-900.ttf"
"$PY" -m fontTools.varLib.instancer "$WORK/manrope.ttf" wght=400:800 -o "$WORK/manrope-400-800.ttf"
"$PY" -m fontTools.varLib.instancer "$WORK/bengali.ttf" wdth=100 wght=900 --static -o "$WORK/bengali-900.ttf"

"$SUBSET" "$WORK/archivo-900.ttf" --unicodes="$LATIN" --layout-features='kern,liga' --flavor=woff2 --output-file="$OUT/archivo-condensed-900.woff2"
"$SUBSET" "$WORK/manrope-400-800.ttf" --unicodes="$LATIN" --layout-features='kern,liga' --flavor=woff2 --output-file="$OUT/manrope.woff2"
"$SUBSET" "$WORK/bengali-900.ttf" --unicodes="U+09F3" --layout-features='' --flavor=woff2 --output-file="$OUT/taka-900.woff2"

{
  echo "Archivo (public/fonts/archivo-condensed-900.woff2)"; cat "$WORK/archivo-OFL.txt"; echo
  echo "Manrope (public/fonts/manrope.woff2)"; cat "$WORK/manrope-OFL.txt"; echo
  echo "Noto Sans Bengali (public/fonts/taka-900.woff2)"; cat "$WORK/bengali-OFL.txt"
} > "$OUT/OFL.txt"

ls -l "$OUT"
