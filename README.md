# Snip

Snip is a tiny URL shortener that demonstrates one backend with two different clients. The Bun API stores links in memory, the Angular web app calls that API from the browser, and the Node CLI uses the same contract from a terminal.

This `main` branch is the superproject. The application layers live on separate orphan branches in this same repository and are mounted here as submodules.

## Layout

```text
snip-demo/
├── backend/   Bun API server mounted from branch backend
├── frontend/  Angular app mounted from branch frontend
├── cli/       Node CLI mounted from branch cli
├── bundle/    Generated release mounted from branch bundle
├── scripts/   Superproject automation
├── .gitmodules
└── README.md
```

Each folder is a gitlink pinned to an exact commit. `.gitmodules` records the path, repository URL, and branch each submodule tracks.
`bundle/` is generated output. Do not hand-edit files inside it; update the source branches and rebuild it instead.

## API Contract

| Method | Path | Body | Success | Error |
| --- | --- | --- | --- | --- |
| POST | `/api/links` | `{ "url": "https://..." }` | `201 { code, url, shortUrl, hits, createdAt }` | `400` on invalid JSON or non-http(s) URL |
| GET | `/api/links` | | `200` array of links | |
| GET | `/:code` | | `302` to the original URL and increments hits | `404` if unknown |

Links are stored in an in-memory `Map`, so restarting the backend clears them by design.

## Clone

Use `--recurse-submodules` so Git populates the mounted folders:

```sh
git clone --recurse-submodules https://github.com/kenken64/snip-workshop-day1.git
```

A plain clone checks out the superproject only, leaving submodule folders empty until you run:

```sh
git submodule update --init --recursive
```

## Run

Start the backend:

```sh
cd backend
bun start
```

Start the frontend in another terminal:

```sh
cd frontend
npm install
npx ng serve
```

Use the CLI in a third terminal:

```sh
cd cli
node cli.js help
node cli.js ls
node cli.js add https://example.com
```

The frontend and CLI expect the backend at `http://localhost:3000`. Set `SNIP_API` for the CLI if the backend runs somewhere else.

Run the generated bundle as one Bun process:

```sh
cd bundle
bun start
```

## Update Workflow

Submodule content and superproject pointers are separate commits. After editing one layer, commit and push from inside that submodule, then update the pointer on `main`.

```sh
cd backend
# edit files
git add -A
git commit -m "Update backend"
git push

cd ..
git submodule update --remote backend
git add backend
git commit -m "Bump backend submodule"
git push
```

Use the same flow for `frontend` and `cli`. The superproject stays a pinned, reproducible snapshot of the three source layers.

To refresh the generated release branch, run:

```sh
node scripts/build-bundle.mjs --push
```

The script updates source submodules, builds the Angular app, assembles `bundle/`, commits generated output only when files changed, and pushes the `bundle` branch plus the resulting `main` pointer when `--push` is present.
