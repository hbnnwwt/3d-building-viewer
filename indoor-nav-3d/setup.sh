#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "Installing dependencies..."
pnpm install

echo "Generating Prisma client..."
cd server && pnpm db:generate && cd ..

echo "Pushing database schema..."
cd server && pnpm db:push && cd ..

echo ""
echo "Setup complete!"
echo ""
echo "To start development:"
echo "  ./scripts/dev.sh        # Start all services"
echo "  ./scripts/dev-server.sh # Start server only"
echo "  ./scripts/dev-viewer.sh  # Start viewer only"