#!/bin/sh
# Seed /app/storage from the baked-in copy (/app/storage-seed) on first run.
# Once the volume has content the seed is never touched again.
if [ ! -f /app/storage/books.json ]; then
  echo "[entrypoint] seeding storage volume from image..."
  cp -r /app/storage-seed/. /app/storage/
fi
exec node server.js
