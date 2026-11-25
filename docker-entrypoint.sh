#!/bin/sh
# Seed /app/storage from the baked-in copy (/app/storage-seed) on first run.
# Each item is seeded independently so a missing files/ dir doesn't require
# wiping books.json and vice-versa.

if [ ! -f /app/storage/books.json ]; then
  echo "[entrypoint] seeding books.json..."
  cp /app/storage-seed/books.json /app/storage/books.json 2>/dev/null || true
fi

if [ ! -f /app/storage/videos.json ]; then
  echo "[entrypoint] seeding videos.json..."
  cp /app/storage-seed/videos.json /app/storage/videos.json 2>/dev/null || true
fi

if [ ! -d /app/storage/files ] || [ -z "$(ls -A /app/storage/files 2>/dev/null)" ]; then
  echo "[entrypoint] seeding storage/files/..."
  mkdir -p /app/storage/files
  cp -r /app/storage-seed/files/. /app/storage/files/ 2>/dev/null || true
fi

exec node server.js
