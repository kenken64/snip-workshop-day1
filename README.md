# Snip CLI

A zero-dependency Node CLI for the Snip URL shortener backend.

## Usage

```sh
node cli.js help
node cli.js add https://example.com
node cli.js ls
node cli.js open abc123
```

Set `SNIP_API` to target a different backend origin. It defaults to `http://localhost:3000`.

## Commands

- `snip add <url>` posts to `/api/links` and prints the returned short URL.
- `snip ls` prints an aligned table of code, hits, and original URL, or `No links yet.`.
- `snip open <code>` asks the backend for `/:code` without following redirects, then opens the redirect target in the OS browser.
- `snip help` or no arguments prints usage.
