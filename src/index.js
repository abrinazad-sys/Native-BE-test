import express from 'express';
import cors from 'cors';
import os from 'os';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;
const LOGIN_URL = 'https://dev.api.pitch.space/api/native/initiate';

const API_KEY = process.env.PITCH_API_KEY || '6cb78b7a-537a-49cc-b6ff-d3cb3a3ae8e7';

const allowedOrigins = new Set([
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:3000',
  'http://localhost:5173'
]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Vary', 'Origin');
  }

  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

app.use(cors(corsOptions));
app.use(express.json());

const getDeviceId = () => {
  const seed = `${os.hostname()}|${os.type()}|${os.arch()}|${os.platform()}`;
  return crypto.createHash('sha256').update(seed).digest('hex');
};

const getPlatform = () => {
  const platform = os.platform();
  const arch = os.arch();
  return `${platform}-${arch}`;
};

app.post('/api/native/initiate', async (req, res) => {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const payload = {
      email,
      circleName: 'Era Test',
      apiKey: API_KEY,
      deviceId: getDeviceId(),
      platform: getPlatform()
    };

    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Login request failed',
        details: data
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Login proxy error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Pitch Space Auth Service listening on http://localhost:${PORT}`);
});
