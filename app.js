const http = require('http');

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Create a lightweight HTTP server using Node.js built-in http module
const server = http.createServer((req, res) => {
  const url = req.url;

  if (url === '/health') {
    // Health check endpoint for post-deployment verification
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'UP', timestamp: new Date().toISOString() }));
  } else {
    // Default endpoint as per project synopsis: Returns "Hello, Node.js!"
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, Node.js!\n');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});

// Graceful shutdown handling for Docker containers
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

