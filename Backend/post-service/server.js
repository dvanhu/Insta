const express = require('express');
require('dotenv').config();
const client = require('prom-client');

const app = express();
const SERVICE_NAME = process.env.SERVICE_NAME || 'post-service';
const PORT = Number(process.env.PORT) || 3003;

client.collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['service', 'method', 'route', 'status_code']
});

app.use((req, res, next) => {
  const end = res.end;
  res.end = function (...args) {
    httpRequestCounter.inc({
      service: SERVICE_NAME,
      method: req.method,
      route: req.path,
      status_code: res.statusCode
    });
    end.apply(this, args);
  };
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: SERVICE_NAME });
});

app.get('/', (req, res) => {
  res.send(`Handled by ${SERVICE_NAME}`);
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`${SERVICE_NAME} running on port ${PORT}`);
});
