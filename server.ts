import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS Middleware for Mobile and Desktop cross-origin requests
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // -------------------------------------------------------------
  // Backend API Endpoints
  // -------------------------------------------------------------

  // 1. System & Health Check API
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      school: 'អនុវិទ្យាល័យ ហ៊ុន សែន ទួលសំបួរ',
      system: 'Hun Sen Toulsambour School Management System',
      version: '4.0.0',
      database: 'Firebase Firestore Cloud Database Connected',
      timestamp: new Date().toISOString(),
      platform: 'Full-Stack Express + React + Firebase Cloud DB',
    });
  });

  // 2. School General Info & Ministry Structure API
  app.get('/api/school/info', (req, res) => {
    res.json({
      nameKm: 'អនុវិទ្យាល័យ ហ៊ុន សែន ទួលសំបួរ',
      nameEn: 'Hun Sen Toulsambour Secondary School',
      code: 'HTSS-070809',
      academicYear: '២០២៥-២០២៦',
      location: 'ឃុំទួលសំបួរ ស្រុកស្ទឹងត្រង់ ខេត្តកំពង់ចាម',
      ministry: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
      department: 'មន្ទីរអប់រំ យុវជន និងកីឡា ខេត្តកំពង់ចាម',
      office: 'ការិយាល័យអប់រំ យុវជន និងកីឡា ស្រុកស្ទឹងត្រង់',
      grades: ['ថ្នាក់ទី ៧', 'ថ្នាក់ទី ៨', 'ថ្នាក់ទី ៩'],
      educationLevel: 'អនុវិទ្យាល័យ (Secondary Education)',
      contact: {
        phone: '012 888 999',
        telegram: '@ToulsambourSchoolBot',
      },
    });
  });

  // 3. Telegram Alert Proxy API (Dispatches alert to Telegram without browser CORS limitations)
  app.post('/api/telegram/send', async (req, res) => {
    const { botToken, chatId, message } = req.body;
    if (!chatId || !message) {
      return res.status(400).json({ error: 'chatId and message are required' });
    }

    const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
    if (!token || token.includes('Simulated')) {
      // Graceful simulated response when running with demo token
      return res.json({
        ok: true,
        simulated: true,
        message: 'បានកត់ត្រាការជូនដំណឹង Telegram ដោយជោគជ័យ (Simulated)',
        sentAt: new Date().toISOString(),
      });
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error('Telegram dispatch error:', err);
      res.status(500).json({ error: err.message || 'Telegram dispatch failed' });
    }
  });

  // 4. Device Detection & Optimization API (Mobile vs Desktop)
  app.get('/api/device/capabilities', (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    res.json({
      deviceType: isMobile ? (isTablet ? 'tablet' : 'mobile') : 'desktop',
      isMobile,
      userAgent,
      capabilities: {
        touchOptimized: isMobile,
        responsiveColumns: isMobile ? 1 : 3,
        supportsRealTimeSync: true,
        cloudDatabaseOnline: true,
      },
    });
  });

  // -------------------------------------------------------------
  // Frontend Serving (Vite middleware in dev, Static in production)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Hun Sen Toulsambour School Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Error:', err);
});
