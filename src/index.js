import express from 'express';
import cors from 'cors';
import os from 'os';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;
const LOGIN_URL = 'https://dev.api.pitch.space/api/auth/login';

const API_KEY = process.env.PITCH_API_KEY || 'cf523484-4327-4092-ab63-34f5b8d74013';

const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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

app.post('/api/login', async (req, res) => {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const payload = {
      email,
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
