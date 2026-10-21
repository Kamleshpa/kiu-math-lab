// Builds the app for static hosting.
//
//   node scripts/build-static.mjs             -> dist/  plain multi-file site, for local testing
//   node scripts/build-static.mjs --encrypt   -> docs/index.html  password-protected single file,
//                                                for GitHub Pages (Deploy from branch: main, /docs)
//
// --encrypt bundles index.html + css/ + js/ into one document and encrypts it with
// AES-256-GCM using a key derived from your password (PBKDF2-SHA256, 600,000 rounds).
// Only the encrypted file is published; without the password there is nothing to read.
// The password comes from $SITE_PASSWORD, or you are asked for it.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { webcrypto as crypto } from "node:crypto";
import readline from "node:readline";

const root = fileURLToPath(new URL("..", import.meta.url));
const ITERATIONS = 600000;
const MIN_PASSWORD = 10;

// index.html is written for the Claude artifact host, which supplies the
// <!doctype>/<html>/<head>/<body> skeleton. Static hosts need it in the file.
const wrapDocument = (src) => {
  const split = src.indexOf("<header");
  if (split < 0) throw new Error("index.html: expected a <header> to mark where <body> starts");
  return `<!doctype html>\n<html lang="en">\n<head>\n${src.slice(0, split).trim()}\n</head>\n<body>\n${src.slice(split).trim()}\n</body>\n</html>\n`;
};

const buildPlain = () => {
  const dist = join(root, "dist");
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  writeFileSync(join(dist, "index.html"), wrapDocument(readFileSync(join(root, "index.html"), "utf8")));
  cpSync(join(root, "css"), join(dist, "css"), { recursive: true });
  cpSync(join(root, "js"), join(dist, "js"), { recursive: true });
  console.log(`Built ${dist}`);
};

// One self-contained document: stylesheet and scripts inlined.
const bundle = () => {
  let html = wrapDocument(readFileSync(join(root, "index.html"), "utf8"));
  const read = (rel) => {
    const text = readFileSync(join(root, rel), "utf8");
    if (/<\/(script|style)/i.test(text)) throw new Error(`${rel} contains a closing script/style tag and can't be inlined`);
    return text;
  };
  html = html.replace(/<link rel="stylesheet" href="(css\/[^"]+)">/g, (_, rel) => `<style>\n${read(rel)}\n</style>`);
  html = html.replace(/<script src="(js\/[^"]+)"><\/script>/g, (_, rel) => `<script>\n${read(rel)}\n</script>`);
  if (/(href|src)="(css|js)\//.test(html)) throw new Error("bundle still references a local css/js file");
  return html;
};

const b64 = (bytes) => Buffer.from(bytes).toString("base64");

const ask = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(question)) process.stdout.write(s); }; // hide typed characters
    rl.question(question, (answer) => { rl.close(); process.stdout.write("\n"); resolve(answer); });
  });

const getPassword = async () => {
  if (process.env.SITE_PASSWORD) return process.env.SITE_PASSWORD;
  if (!process.stdin.isTTY) throw new Error("Set SITE_PASSWORD, or run this in a terminal to be asked for the password.");
  const a = await ask("Choose the site password: ");
  const b = await ask("Type it again: ");
  if (a !== b) throw new Error("The two passwords don't match. Nothing was built.");
  return a;
};

// Reuse the salt from the previous build, so a device that chose "Remember on this
// device" stays unlocked after an update (as long as the password is unchanged).
const previousSalt = (file) => {
  if (!existsSync(file)) return null;
  const m = readFileSync(file, "utf8").match(/<script id="payload" type="application\/json">([^<]+)<\/script>/);
  try { return m ? Buffer.from(JSON.parse(m[1]).salt, "base64") : null; } catch { return null; }
};

const buildEncrypted = async () => {
  const password = await getPassword();
  if (password.length < MIN_PASSWORD)
    throw new Error(`Use at least ${MIN_PASSWORD} characters. A few random words like "purple-tiger-pancake-42" are easy for a kid to type and hard to guess.`);
  const outDir = join(root, "docs");
  const outFile = join(outDir, "index.html");
  const salt = previousSalt(outFile) || crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(bundle()));
  const payload = JSON.stringify({ v: 1, iter: ITERATIONS, salt: b64(salt), iv: b64(iv), data: b64(new Uint8Array(data)) });
  const gate = readFileSync(join(root, "scripts", "gate.html"), "utf8").replace("__PAYLOAD__", () => payload);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, gate);
  writeFileSync(join(outDir, ".nojekyll"), "");
  console.log(`Built ${outFile} (password-protected). Commit docs/ and push.`);
};

try {
  if (process.argv.includes("--encrypt")) await buildEncrypted();
  else buildPlain();
} catch (e) {
  console.error(e.message);
  process.exit(1);
}
