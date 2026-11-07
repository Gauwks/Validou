require('dotenv').config();
const path = require('path');
const admin = require('firebase-admin');

// >>> ÚNICO PONTO que você precisa configurar para ligar a API ao Firebase <<<
// Coloque o JSON da conta de serviço na raiz e aponte o caminho no .env.
const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!admin.apps.length) {
  if (keyPath) {
    const serviceAccount = require(path.resolve(keyPath));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else {
  
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  }
}

const db = admin.firestore();
const auth = admin.auth();
const { FieldValue, Timestamp } = admin.firestore;

module.exports = { admin, db, auth, FieldValue, Timestamp };
