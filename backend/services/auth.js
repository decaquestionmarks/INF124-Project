const admin = require('firebase-admin');

const DEFAULT_FIREBASE_PROJECT_ID = 'foodly-4d744';

const parseServiceAccount = (rawValue) => {
  if (!rawValue) return null;

  const decodedValue = rawValue.trim().startsWith('{')
    ? rawValue
    : Buffer.from(rawValue, 'base64').toString('utf8');

  return JSON.parse(decodedValue);
};

const getFirebaseApp = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  const serviceAccount = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  const projectId =
    serviceAccount?.project_id ||
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    DEFAULT_FIREBASE_PROJECT_ID;

  if (serviceAccount) {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId,
    });
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId,
    });
  }

  return admin.initializeApp({ projectId });
};

const getBearerToken = (authorizationHeader = '') => {
  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

const requireAuth = async (req, res, next) => {
  const idToken = getBearerToken(req.headers.authorization);

  if (!idToken) {
    return res.status(401).json({ error: 'Missing Firebase ID token' });
  }

  try {
    const app = getFirebaseApp();
    const decodedToken = await admin.auth(app).verifyIdToken(idToken);
    req.user = decodedToken;
    return next();
  } catch (error) {
    console.error('Firebase auth failed:', error.message);
    return res.status(401).json({ error: 'Invalid Firebase ID token' });
  }
};

module.exports = {
  requireAuth,
};
