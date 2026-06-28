export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

  // Load configuration from environment variables or fall back to default credentials
  const config = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyB5h2R-rijQfwj57kG-uyecKze7wELQUiA",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "city-pizza-house.firebaseapp.com",
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://city-pizza-house-default-rtdb.firebaseio.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "city-pizza-house",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "city-pizza-house.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "507480462438",
    appId: process.env.FIREBASE_APP_ID || "1:507480462438:web:8442084c19fdd2bf8dc9a7",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-EHK4FTS0CW"
  };

  res.status(200).send(`window.firebaseConfig = ${JSON.stringify(config)};`);
}
