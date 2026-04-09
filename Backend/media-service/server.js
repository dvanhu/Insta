const express = require('express');
const dotenv = require('dotenv').config();
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 Collect default metrics
client.collectDefaultMetrics();

// 🔥 Correct counter with labels
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['service']
});

// 🔥 CORRECT middleware (THIS IS KEY)
app.use((req, res, next) => {
  httpRequestCounter.inc({ service: 'media-service' });
  next();
});

// Health route
app.get("/", (req, res) => {
  res.send("Handled by service");
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Listen
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Service running on port ${PORT}`);
});
