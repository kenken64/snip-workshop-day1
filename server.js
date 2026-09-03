const links = new Map();

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const PORT = Number.parseInt(Bun.env.PORT || "3000", 10);
const PUBLIC_DIR = Bun.env.PUBLIC_DIR;

function resolveBaseUrl() {
  if (Bun.env.BASE_URL) {
    return Bun.env.BASE_URL.replace(/\/$/, "");
  }

  if (Bun.env.RAILWAY_PUBLIC_DOMAIN) {
    return `https://${Bun.env.RAILWAY_PUBLIC_DOMAIN}`;
  }

  return `http://localhost:${PORT}`;
}

const BASE_URL = resolveBaseUrl();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function text(message, status = 200, headers = {}) {
  return new Response(message, {
    status,
    headers: {
      ...corsHeaders,
      ...headers,
    },
  });
}

function randomCode() {
  let code = "";

  for (let index = 0; index < 6; index += 1) {
    code += BASE62[Math.floor(Math.random() * BASE62.length)];
  }

  return code;
}

function createCode() {
  let code = randomCode();

  while (links.has(code)) {
    code = randomCode();
  }

  return code;
}

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function contentTypeFor(pathname) {
  if (pathname.endsWith(".html")) return "text/html; charset=utf-8";
  if (pathname.endsWith(".css")) return "text/css; charset=utf-8";
  if (pathname.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (pathname.endsWith(".json")) return "application/json; charset=utf-8";
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return "image/jpeg";
  if (pathname.endsWith(".webp")) return "image/webp";
  if (pathname.endsWith(".ico")) return "image/x-icon";
  return "application/octet-stream";
}

async function serveStatic(pathname) {
  if (!PUBLIC_DIR) {
    return null;
  }

  const requestPath = pathname === "/" ? "/index.html" : pathname;
  const decodedPath = decodeURIComponent(requestPath);

  if (decodedPath.includes("\0") || decodedPath.split("/").includes("..")) {
    return null;
  }

  const filePath = `${PUBLIC_DIR.replace(/\/$/, "")}${decodedPath}`;
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    return null;
  }

  return new Response(file, {
    headers: {
      ...corsHeaders,
      "Content-Type": contentTypeFor(decodedPath),
    },
  });
}

const server = Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === "POST" && url.pathname === "/api/links") {
      let body;

      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON" }, 400);
      }

      if (!body || typeof body.url !== "string" || !isHttpUrl(body.url)) {
        return json({ error: "URL must start with http:// or https://" }, 400);
      }

      const code = createCode();
      const link = {
        code,
        url: body.url,
        shortUrl: `${BASE_URL}/${code}`,
        hits: 0,
        createdAt: new Date().toISOString(),
      };

      links.set(code, link);
      return json(link, 201);
    }

    if (request.method === "GET" && url.pathname === "/api/links") {
      return json(Array.from(links.values()));
    }

    if (request.method === "GET") {
      const staticResponse = await serveStatic(url.pathname);

      if (staticResponse) {
        return staticResponse;
      }

      const code = decodeURIComponent(url.pathname.slice(1));
      const link = links.get(code);

      if (link) {
        link.hits += 1;
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            Location: link.url,
          },
        });
      }
    }

    return text("Not found", 404, { "Content-Type": "text/plain; charset=utf-8" });
  },
});

console.log(`Snip backend listening on http://localhost:${server.port}`);
