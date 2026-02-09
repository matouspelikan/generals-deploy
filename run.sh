#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GENERALS_BOTS_DIR="$SCRIPT_DIR/../generals-bots"

echo "=== Generals Deploy - Local Setup ==="

if [ ! -d "$GENERALS_BOTS_DIR" ]; then
    echo "Error: generals-bots not found at $GENERALS_BOTS_DIR"
    exit 1
fi

VENV_DIR="$SCRIPT_DIR/.venv"
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

echo "Activating virtual environment..."
source "$VENV_DIR/bin/activate"

echo "Installing dependencies..."
pip install -q -r "$SCRIPT_DIR/backend/requirements.txt"
pip install -q -e "$GENERALS_BOTS_DIR"

export PYTHONPATH="$GENERALS_BOTS_DIR:$SCRIPT_DIR/backend:$PYTHONPATH"

echo ""
echo "=== Starting server at http://localhost:8000 ==="
echo ""
cd "$SCRIPT_DIR/backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
