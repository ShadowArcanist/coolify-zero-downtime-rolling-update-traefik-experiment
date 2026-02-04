const http = require('http');
const config = require('./config');
const { handleRoot, handleHealth, handleNotFound } = require('./routes');

class Server {
  constructor() {
    this.server = null;
    this.connections = new Set();
    this.shuttingDown = false;
  }

  createServer() {
    return http.createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const { url } = req;

      if (url === '/') {
        handleRoot(req, res);
      } else if (url === '/api/health') {
        handleHealth(req, res);
      } else {
        handleNotFound(req, res);
      }
    });
  }

  trackConnection(socket) {
    this.connections.add(socket);
    socket.on('close', () => {
      this.connections.delete(socket);
    });
  }

  start() {
    this.server = this.createServer();

    this.server.on('connection', (socket) => {
      this.trackConnection(socket);
    });

    this.server.listen(config.PORT, () => {
      console.log(`Server listening on port ${config.PORT}`);
    });

    this.setupGracefulShutdown();
  }

  setupGracefulShutdown() {
    const shutdown = (signal) => {
      console.log(`\nReceived ${signal}, starting graceful shutdown...`);
      this.shuttingDown = true;

      setTimeout(() => {
        console.log(`Shutting down after ${config.SHUTDOWN_DELAY_MS}ms delay...`);

        this.server.close(() => {
          console.log('Server closed');
          process.exit(0);
        });
      }, config.SHUTDOWN_DELAY_MS);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

module.exports = Server;