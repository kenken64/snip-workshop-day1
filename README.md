# Snip Backend

A tiny Bun URL shortener API with zero npm dependencies, backed by SQLite
(via Bun's built-in `bun:sqlite`).

## Run

```sh
bun start
```

The server listens on `PORT`, defaulting to `3000`. `BASE_URL` controls generated short links. If `BASE_URL` is unset and `RAILWAY_PUBLIC_DOMAIN` exists, short links use `https://$RAILWAY_PUBLIC_DOMAIN`; otherwise they use `http://localhost:$PORT`.

`DB_PATH` sets where the SQLite file lives (default `./snip.db`; `.env` sets it to `/app/data/snip.db` for deployment). The parent directory is created automatically if it doesn't exist. **In production, `DB_PATH` must point inside a mounted persistent volume** — Railway's filesystem is otherwise ephemeral across redeploys, so without a volume attached at that path, links would still be lost on every deploy even though they now survive a plain restart.

Set `PUBLIC_DIR` to serve static files alongside the API. `/` maps to `index.html`, and existing static files are served before same-named short codes.

## API

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| POST | `/api/links` | `{ "url": "https://..." }` | `201 { code, url, shortUrl, hits, createdAt }` |
| GET | `/api/links` | | `200` array of links |
| GET | `/:code` | | `302` to original URL and increments hits, or `404` |

Links are stored in SQLite at `DB_PATH`, so they survive process restarts (and redeploys, as long as `DB_PATH` is on a mounted volume).
