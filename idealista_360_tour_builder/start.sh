#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  IDEALISTA 360 TOUR BUILDER — Script de arranque (macOS)
# ─────────────────────────────────────────────────────────────

set -euo pipefail

SOURCE_FOLDER="/Volumes/Extreme 2TB/Insta360 x3/2026/2026-05-13 - Imaugem 006 - Maja Cascais/merged 360"

# ── Verifica pasta fonte ──────────────────────────────────────
if [ ! -d "$SOURCE_FOLDER" ]; then
  echo ""
  echo "ERRO: Pasta não encontrada:"
  echo "  $SOURCE_FOLDER"
  echo ""
  echo "Verifica se o disco externo está ligado e tenta novamente."
  exit 1
fi

echo ""
echo "═══════════════════════════════════════════"
echo "  IDEALISTA 360 TOUR BUILDER"
echo "═══════════════════════════════════════════"
echo "  Pasta: $SOURCE_FOLDER"

# ── Localiza Python 3 ─────────────────────────────────────────
PYTHON=""
for candidate in python3 python3.12 python3.11 python3.10 python3.9; do
  if command -v "$candidate" &>/dev/null; then
    PYTHON="$candidate"
    break
  fi
done

if [ -z "$PYTHON" ]; then
  echo ""
  echo "ERRO: Python 3 não encontrado."
  echo "Instala em: https://www.python.org/downloads/"
  exit 1
fi

echo "  Python: $($PYTHON --version)"

# ── Caminho do script ─────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Ambiente virtual ──────────────────────────────────────────
VENV_DIR="$SCRIPT_DIR/.venv"

if [ ! -d "$VENV_DIR" ]; then
  echo ""
  echo "  A criar ambiente virtual..."
  "$PYTHON" -m venv "$VENV_DIR"
fi

# shellcheck source=/dev/null
source "$VENV_DIR/bin/activate"

# ── Dependências ──────────────────────────────────────────────
echo "  A verificar dependências..."
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

# ── Arrancar ──────────────────────────────────────────────────
echo ""
echo "  A iniciar servidor em http://localhost:5050"
echo "  (o browser abre automaticamente)"
echo "  Prima Ctrl+C para parar."
echo "═══════════════════════════════════════════"
echo ""

SOURCE_FOLDER="$SOURCE_FOLDER" python app.py
