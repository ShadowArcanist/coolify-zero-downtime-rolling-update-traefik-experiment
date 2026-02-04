const config = require('./config');

let startTime = Date.now();

function getWelcomePage() {
  return `<!DOCTYPE html>
<html>
<head>
    <title>Welcome</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>Welcome!</h1>
    <p>If you see this page, the web server is successfully installed and working.</p>
</body>
</html>`;
}

function handleRoot(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(getWelcomePage());
}

function handleHealth(req, res) {
  const elapsed = Date.now() - startTime;
  
  if (elapsed < config.STARTUP_DELAY_MS) {
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    res.end('Service Unavailable');
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
}

function handleNotFound(req, res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}

module.exports = {
  handleRoot,
  handleHealth,
  handleNotFound,
};