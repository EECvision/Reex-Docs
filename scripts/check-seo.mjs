import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import net from "node:net";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const siteUrl = "https://docs.reex-api.dev";
const manifest = JSON.parse(
  await readFile(new URL("../.next/server/app-paths-manifest.json", import.meta.url), "utf8"),
);
const paths = Object.keys(manifest)
  .filter(path => path.endsWith("/page") && !path.startsWith("/_"))
  .map(path => path.slice(0, -5) || "/")
  .sort();
assert.ok(paths.length > 0, "Build the app before running the SEO checks.");

function decode(value) {
  return value.replace(/&(?:amp|quot|lt|gt|apos|#x[0-9a-f]+|#\d+);/gi, entity => {
    const named = { "&amp;": "&", "&quot;": '"', "&lt;": "<", "&gt;": ">", "&apos;": "'" };
    if (entity in named) return named[entity];
    return String.fromCodePoint(
      entity.startsWith("&#x") ? parseInt(entity.slice(3), 16) : parseInt(entity.slice(2), 10),
    );
  });
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(match => [match[1], decode(match[2])]),
  );
}

function inspect(html) {
  const head = html.split("</head>")[0];
  const tags = [...head.matchAll(/<meta\b[^>]*>/g)].map(match => attributes(match[0]));
  const links = [...head.matchAll(/<link\b[^>]*>/g)].map(match => attributes(match[0]));
  return {
    titles: [...head.matchAll(/<title>(.*?)<\/title>/gs)].map(match => decode(match[1])),
    meta: key => tags.filter(tag => tag.name === key || tag.property === key).map(tag => tag.content),
    links: rel => links.filter(link => link.rel === rel).map(link => link.href),
    graph: [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)]
      .flatMap(match => {
        const data = JSON.parse(match[1]);
        assert.equal(data["@context"], "https://schema.org");
        return data["@graph"] || [data];
      }),
  };
}

const remoteUrl = process.argv[2] ? new URL(process.argv[2]) : null;
if (remoteUrl) {
  assert.match(remoteUrl.protocol, /^https?:$/, "Use an HTTP or HTTPS URL.");
  assert.equal(remoteUrl.pathname, "/", "Use the documentation site's root URL.");
}
let baseUrl = remoteUrl?.origin;
let server;
let logs = "";
if (!baseUrl) {
  const reservation = net.createServer();
  await new Promise(resolve => reservation.listen(0, "127.0.0.1", resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  baseUrl = `http://127.0.0.1:${port}`;
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: projectRoot, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
  );
  server.stdout.on("data", chunk => { logs += chunk; });
  server.stderr.on("data", chunk => { logs += chunk; });
}

function request(path, options = {}) {
  return fetch(new URL(path, baseUrl), { signal: AbortSignal.timeout(15000), ...options });
}

try {
  if (server) await new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      server.stdout.off("data", onData);
      server.off("exit", onExit);
      server.off("error", onError);
    };
    const onData = () => {
      if (logs.includes("Ready in")) { cleanup(); resolve(); }
    };
    const onExit = code => { cleanup(); reject(new Error(`Server exited ${code}: ${logs}`)); };
    const onError = error => { cleanup(); reject(error); };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Server startup timed out: ${logs}`));
    }, 30000);
    server.stdout.on("data", onData);
    server.once("exit", onExit);
    server.once("error", onError);
    onData();
  });

  const titles = new Set();
  const descriptions = new Set();

  for (const path of paths) {
    const canonical = new URL(path, siteUrl).href;
    const response = await request(path);
    assert.equal(response.status, 200, `${path}: page must be accessible`);
    assert.ok(!/noindex/i.test(response.headers.get("x-robots-tag") || ""), `${path}: indexing header`);
    const html = await response.text();
    const page = inspect(html);

    assert.equal(page.titles.length, 1, `${path}: one title`);
    const [title] = page.titles;
    assert.ok(title.endsWith(" | Reex API Builder"), `${path}: branded title`);
    assert.ok(!titles.has(title), `${path}: unique title`);
    titles.add(title);

    const description = page.meta("description");
    assert.equal(description.length, 1, `${path}: one description`);
    assert.ok(description[0].trim().length > 0, `${path}: nonempty description`);
    assert.ok(!descriptions.has(description[0]), `${path}: unique description`);
    descriptions.add(description[0]);

    assert.deepEqual(page.links("canonical").map(url => new URL(url).href), [canonical], `${path}: canonical URL`);
    assert.deepEqual(page.links("icon"), ["/favicon.png"], `${path}: square PNG favicon`);
    assert.deepEqual(page.links("apple-touch-icon"), ["/apple-touch-icon.png"], `${path}: Apple touch icon`);
    assert.ok(!page.meta("robots").some(value => /noindex/i.test(value)), `${path}: indexing allowed`);
    assert.equal([...html.matchAll(/<h1\b/g)].length, 1, `${path}: one main heading`);
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
    assert.ok(main, `${path}: server-rendered main content`);
    let previousLevel = 0;
    for (const [, level] of main.matchAll(/<h([1-6])\b/g)) {
      assert.ok(Number(level) <= previousLevel + 1, `${path}: heading hierarchy skips a level`);
      previousLevel = Number(level);
    }
    assert.ok(!/<p\b[^>]*>\s*<p\b/.test(main), `${path}: no nested paragraphs that break hydration`);
    assert.ok(!/href="\/docs(?:\/|"|\?)/.test(html), `${path}: no old navigation URLs`);

    for (const [key, value] of Object.entries({
      "og:title": title,
      "og:description": description[0],
      "og:url": canonical,
      "og:site_name": "Reex API Builder Documentation",
      "og:type": "website",
      "og:image": `${siteUrl}/og-image.png`,
      "og:image:width": "1200",
      "og:image:height": "630",
      "twitter:card": "summary_large_image",
      "twitter:title": title,
      "twitter:description": description[0],
      "twitter:image": `${siteUrl}/og-image.png`,
    })) {
      const actual = page.meta(key);
      assert.deepEqual(key === "og:url" ? actual.map(url => new URL(url).href) : actual, [value], `${path}: ${key}`);
    }
    assert.ok(page.meta("og:image:alt")[0], `${path}: image description`);

    const document = page.graph.find(node => node["@type"] === (path === "/" ? "WebPage" : "TechArticle"));
    assert.ok(document, `${path}: document structured data`);
    assert.equal(document.url, canonical);
    assert.equal(document.description, description[0]);
    assert.equal(document.image, `${siteUrl}/og-image.png`);
    if (path === "/") {
      const website = page.graph.find(node => node["@type"] === "WebSite");
      assert.equal(website?.url, canonical);
      assert.equal(website?.name, "Reex API Builder Documentation");
    } else {
      const breadcrumbs = page.graph.find(node => node["@type"] === "BreadcrumbList");
      assert.ok(breadcrumbs, `${path}: breadcrumb structured data`);
      assert.equal(breadcrumbs.itemListElement.length, path.split("/").filter(Boolean).length + 1);
      assert.equal(breadcrumbs.itemListElement[0].item, `${siteUrl}/`);
      assert.equal(breadcrumbs.itemListElement.at(-1).item, canonical);
      breadcrumbs.itemListElement.forEach((item, index) => {
        assert.equal(item.position, index + 1);
        assert.ok(item.name);
        assert.ok(paths.includes(new URL(item.item).pathname), `${path}: breadcrumb target exists`);
      });
    }

    const legacy = await request(`/docs${path === "/" ? "" : path}?from=old&section=setup`, { redirect: "manual" });
    assert.equal(legacy.status, 308, `${path}: permanent redirect`);
    const location = new URL(legacy.headers.get("location"), baseUrl);
    assert.equal(location.pathname, path);
    assert.equal(location.search, "?from=old&section=setup");
  }

  const sitemap = await request("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  assert.match(sitemap.headers.get("content-type"), /xml/);
  const xml = await sitemap.text();
  const locations = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1]));
  assert.deepEqual(locations.sort(), paths.map(path => new URL(path, siteUrl).href).sort(), "Sitemap covers every page exactly once");
  for (const [, lastModified] of xml.matchAll(/<lastmod>(.*?)<\/lastmod>/g)) {
    const timestamp = Date.parse(lastModified);
    assert.ok(Number.isFinite(timestamp) && timestamp <= Date.now(), "Sitemap uses valid modification dates");
  }

  const robots = await request("/robots.txt");
  assert.equal(robots.status, 200);
  const rules = await robots.text();
  assert.match(rules, /^User-Agent: \*$/im);
  assert.match(rules, /^Allow: \/$/m);
  assert.ok(rules.includes(`Sitemap: ${siteUrl}/sitemap.xml`));
  assert.ok(!/^Disallow: \/\s*$/m.test(rules), "Crawler access stays open");

  const queriedPage = inspect(await (await request("/dev-mode/getting-started?utm_source=seo-check")).text());
  assert.deepEqual(queriedPage.links("canonical"), [`${siteUrl}/dev-mode/getting-started`]);

  const missing = await request("/seo-check-missing-page");
  assert.equal(missing.status, 404);
  assert.ok(inspect(await missing.text()).meta("robots").some(value => /noindex/i.test(value)));

  for (const [path, contentType] of [
    ["/og-image.png", "image/png"],
    ["/logo-icon.svg", "image/svg+xml"],
    ["/logo.svg", "image/svg+xml"],
    ["/favicon.png", "image/png"],
    ["/apple-touch-icon.png", "image/png"],
  ]) {
    const response = await request(path);
    assert.equal(response.status, 200, `${path}: image is available`);
    assert.equal(response.headers.get("content-type").split(";")[0], contentType);
    const data = Buffer.from(await response.arrayBuffer());
    const suppliedAsset = await readFile(new URL(`../public${path}`, import.meta.url));
    assert.deepEqual(data, suppliedAsset, `${path}: serves the supplied asset unchanged`);
    if (contentType === "image/png") {
      assert.equal(data.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      const size = path === "/og-image.png" ? [1200, 630]
        : path === "/favicon.png" ? [96, 96] : [180, 180];
      assert.equal(data.readUInt32BE(16), size[0]);
      assert.equal(data.readUInt32BE(20), size[1]);
    }
  }

  console.log(`SEO checks passed for ${paths.length} pages at ${baseUrl}: unique metadata, canonicals, social cards, structured data, sitemap, robots, redirects, and 404 handling.`);
} finally {
  if (server && server.exitCode === null && server.signalCode === null) {
    const stopped = new Promise(resolve => server.once("exit", resolve));
    server.kill();
    await stopped;
  }
}
