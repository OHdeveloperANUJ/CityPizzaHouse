export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

  // Load configuration from environment variables or fall back to default credentials
  const config = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyB0mIWQvYIQLePgkpsbCuAVCCwAwAVLit0",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "cafe-pizza-house.firebaseapp.com",
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://cafe-pizza-house-default-rtdb.firebaseio.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "cafe-pizza-house",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "cafe-pizza-house.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "328882657931",
    appId: process.env.FIREBASE_APP_ID || "1:328882657931:web:12f0eb0606b15a5d9fd28e",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-NZVTCV53JB"
  };

  res.status(200).send(`window.firebaseConfig = ${JSON.stringify(config)};`);
}
