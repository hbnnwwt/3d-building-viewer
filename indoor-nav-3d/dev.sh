#!/bin/bash
set -e

cd "$(dirname "$0")/.."

echo "Starting server (port 3001)..."
cd server && pnpm dev &
SERVER_PID=$!

echo "Starting viewer (port 5173)..."
cd ../apps/viewer && pnpm dev &
VIEWER_PID=$!

echo ""
echo "Services started:"
echo "  Server:  http://localhost:3001"
echo "  Viewer:  http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $SERVER_PID $VIEWER_PID 2>/dev/null" EXIT

wait