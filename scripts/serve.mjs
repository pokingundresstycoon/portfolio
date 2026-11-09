// A minimal static server for the built site, used by the browser tests and the asset renderer.
// (`astro preview` detaches into the background when it detects an AI agent, so it can't be
// the foreground process Playwright waits on.) Usage: node scripts/serve.mjs <dir> <port>
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
};

export function serve(dir, port) {
  const isFile = (p) => stat(p).then((s) => s.isFile(), () => false);
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
    const candidates = path.endsWith('/') ? [join(dir, path, 'index.html')] : [join(dir, path), join(dir, path, 'index.html')];
    for (const file of candidates) {
      if (await isFile(file)) {
        const type = TYPES[extname(file)] ?? 'application/octet-stream';
        const body = await readFile(file);
        // Compress text the way the real host does, so speed measurements are honest.
        if (/text|javascript|json|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
          res.writeHead(200, { 'content-type': type, 'content-encoding': 'gzip' });
          return res.end(gzipSync(body));
        }
        res.writeHead(200, { 'content-type': type });
        return res.end(body);
      }
    }
    const notFound = join(dir, '404.html');
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    res.end((await isFile(notFound)) ? await readFile(notFound) : 'Not found');
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [dir = 'dist', port = '4321'] = process.argv.slice(2);
  await serve(dir, Number(port));
  console.log(`Serving ${dir} at http://localhost:${port}`);
}
