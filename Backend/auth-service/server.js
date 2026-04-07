const express = require('express');
const dotenv = require('dotenv').config();

const client = require('prom-client'); // 🔥 metrics

const authRoutes = require('./Routes/authRoutes');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5001;

/* -------------------- HEALTH CHECK -------------------- */
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

/* -------------------- METRICS SETUP -------------------- */
const counter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total HTTP Requests',
});

/* Middleware to count requests */
app.use((req, res, next) => {
    counter.inc();
    next();
});

/* Metrics endpoint */
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

/* -------------------- ROUTES -------------------- */
app.use("/", authRoutes);

/* -------------------- SERVER -------------------- */
app.listen(PORT, () => {
    console.log(`Auth-service is running on port ${PORT}`);
});
