const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types dictionary for static file serving
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  // 1. Health check endpoint: Serves HTML in browsers, JSON for automated monitors
  if (urlPath === '/health') {
    const isJsonRequested = req.url.includes('format=json') ||
      (req.headers.accept && !req.headers.accept.includes('text/html'));

    if (isJsonRequested) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        status: 'UP',
        port: PORT,
        uptime_seconds: Math.floor(process.uptime()),
        memory_mb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
        node_version: process.version,
        timestamp: new Date().toISOString()
      }, null, 2));
    }

    // Serve minimalist HTML health page for browser requests
    const healthTemplatePath = path.join(PUBLIC_DIR, 'health.html');
    fs.readFile(healthTemplatePath, 'utf8', (err, html) => {
      if (err) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: 'UP', timestamp: new Date().toISOString() }));
      }

      const uptimeSec = Math.floor(process.uptime());
      const hours = Math.floor(uptimeSec / 3600);
      const minutes = Math.floor((uptimeSec % 3600) / 60);
      const seconds = uptimeSec % 60;
      const uptimeStr = `${hours}h ${minutes}m ${seconds}s (${uptimeSec}s)`;
      const memoryMb = Math.round(process.memoryUsage().rss / (1024 * 1024));

      const rendered = html
        .replace('{{UPTIME}}', uptimeStr)
        .replace('{{NODE_VERSION}}', process.version)
        .replace('{{MEMORY_MB}}', String(memoryMb))
        .replace('{{PORT}}', String(PORT))
        .replace('{{TIMESTAMP}}', new Date().toISOString());

      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(rendered);
    });
    return;
  }

  // 2. Resolve requested file path (default to index.html for root '/')
  let relativePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  let filePath = path.join(PUBLIC_DIR, relativePath);

  // Security check: Prevent path traversal outside PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden\n');
  }

  // Read file dynamically from disk on each request (hot-reload friendly)
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (urlPath === '/' || urlPath === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        return res.end('Hello, Node.js!\n');
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found\n');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});

// Graceful shutdown handling for container lifecycles
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
