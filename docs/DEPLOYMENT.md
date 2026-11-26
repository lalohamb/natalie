# Deployment & Storage Operations

## Storage architecture

Books, videos, and uploaded cover images are stored in a directory that is
mounted into the container at runtime. This means content survives redeploys.

| Path inside container | Host path (Coolify) | Contents |
|---|---|---|
| `/app/storage/books.json` | `/data/coolify/applications/7xasx33ju8brs7r9vfmhufmj/storage/books.json` | Book catalog |
| `/app/storage/videos.json` | `…/storage/videos.json` | Video catalog |
| `/app/storage/about.json` | `…/storage/about.json` | About page portrait + tab content |
| `/app/storage/files/` | `…/storage/files/` | Uploaded cover images |

The environment variable `MEDIA_STORAGE_DIR=/app/storage` tells the app where
to read and write. Do not change this unless the mount path changes.

## Coolify volume mount settings

| Field | Value |
|---|---|
| Type | Directory |
| Source Directory | `/data/coolify/applications/7xasx33ju8brs7r9vfmhufmj/storage` |
| Destination Directory | `/app/storage` |

## First-boot seeding

The Docker image bakes the committed `storage/` content into `/app/storage-seed/`.
On first boot, `docker-entrypoint.sh` checks whether `books.json`, `videos.json`,
`about.json`, and `files/` exist in the mounted directory. Any that are missing are copied from
the seed. This means:

- A fresh volume is automatically populated on first deploy.
- Subsequent deploys never overwrite content the owner has added via the admin.
- If you need to reset to the committed seed, delete the file from the host
  directory and redeploy.

## Editing the About page

1. Sign in at `/admin`
2. Go to **About**
3. Select a portrait from the Files library (upload first at **Files** if needed)
4. Edit tab labels, content, and drag order using ↑ ↓
5. Save — written to `/app/storage/about.json`; `/about` cache is busted immediately

If no portrait is selected the page falls back to the default bundled portrait.

## Adding a new book

### In production (owner workflow)
1. Sign in at `/admin`
2. Go to **Books → Add book**
3. Fill in all fields, upload a cover image, select the Stripe product and price
4. Save — the book is written to `/app/storage/books.json` on the host immediately
5. The public `/books` page reflects the change on next request (cache is busted on save)

### Locally (developer workflow)
1. Run `npm run dev`
2. Add the book via `/admin/books/new`
3. `git add storage/` and commit — this updates the seed for future fresh deploys

## Cover images

Cover images uploaded via the admin are saved to `/app/storage/files/` and
served at `/media-files/<filename>` by the route handler at
`src/app/media-files/[file]/route.ts`.

The five original cover images were also copied to `/public/` and their
`coverUrl` values in `books.json` updated to `/cover-*.jpg` so they are served
as static assets directly by Next.js (faster, no route handler needed). New
covers uploaded via the admin will use `/media-files/` paths.

## Environment variables (production)

| Variable | Value | Purpose |
|---|---|---|
| `MEDIA_STORAGE_DIR` | `/app/storage` | Where books.json, videos.json and uploads live |
| `ADMIN_READONLY` | _(unset)_ | Unset allows writes; set to `true` to block all admin writes |
| `STRIPE_SECRET_KEY` | `sk_live_…` | Live mode Stripe key |
| `STRIPE_AUTOMATIC_TAX` | `true` | Stripe Tax enabled at checkout |

## Permissions

The container runs as `nextjs` (uid 1001). The Dockerfile pre-creates
`/app/storage` owned by `nextjs:nodejs` before the volume is mounted, so the
entrypoint and the app can write to it without permission errors.

If you see `permission denied` errors on the storage directory, the host
directory was created by root before the container started. Fix with:

```bash
chown -R 1001:1001 /data/coolify/applications/7xasx33ju8brs7r9vfmhufmj/storage
```

After fixing ownership, seed the storage manually from the container Terminal
(Coolify → app → Terminal):

```sh
cp /app/storage-seed/books.json /app/storage/books.json
cp /app/storage-seed/videos.json /app/storage/videos.json
cp /app/storage-seed/about.json /app/storage/about.json
mkdir -p /app/storage/files
```

> **Why this happens**: When Coolify creates the host directory for a new
> volume mount it is owned by `root`. The entrypoint script cannot write to it
> until ownership is corrected on the host. This is a one-time fix — once the
> directory is owned by uid 1001 the entrypoint will seed it automatically on
> every future fresh deploy.
