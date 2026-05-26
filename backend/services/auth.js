const admin = require('firebase-admin');
// const serviceAccount = require('../path/to/serviceAccountKey.json'); // Update with actual path to your Firebase service account key
const serviceAccount = "Temp"; // Placeholder - replace with actual service account key in production

const createAuthMiddleware = (serviceAccount) => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  
  return (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).send('Unauthorized');
    }

    const idToken = authorizationHeader.split('Bearer ')[1];

    admin.auth().verifyIdToken(idToken)
      .then((decodedToken) => {
        req.user = decodedToken;
        next();
      })
      .catch(() => {
        res.status(401).send('Unauthorized');
      });
  };
};

module.exports = createAuthMiddleware;