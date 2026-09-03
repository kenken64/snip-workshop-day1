# Snip Backend

A tiny Bun URL shortener API with zero npm dependencies and in-memory storage.

## Run

```sh
bun start
```

The server listens on `PORT`, defaulting to `3000`. `BASE_URL` controls generated short links. If `BASE_URL` is unset and `RAILWAY_PUBLIC_DOMAIN` exists, short links use `https://$RAILWAY_PUBLIC_DOMAIN`; otherwise they use `http://localhost:$PORT`.

Set `PUBLIC_DIR` to serve static files alongside the API. `/` maps to `index.html`, and existing static files are served before same-named short codes.

## API

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| POST | `/api/links` | `{ "url": "https://..." }` | `201 { code, url, shortUrl, hits, createdAt }` |
| GET | `/api/links` | | `200` array of links |
| GET | `/:code` | | `302` to original URL and increments hits, or `404` |

Links are stored in an in-memory `Map`, so restarts clear all data by design.
