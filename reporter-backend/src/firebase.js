import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase Admin SDK
let firebaseApp;
let useFirebase = false;

try {
  let credentialsPath = process.env.FIREBASE_CREDENTIALS_PATH;
  
  if (!credentialsPath) {
    throw new Error('FIREBASE_CREDENTIALS_PATH environment variable is not set');
  }

  // Resolve relative paths from backend root (up one level from src)
  if (!path.isAbsolute(credentialsPath)) {
    credentialsPath = path.resolve(__dirname, '..', credentialsPath);
  }

  console.log('📂 Looking for Firebase credentials at:', credentialsPath);

  // Check if file exists
  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`Firebase credentials file not found at: ${credentialsPath}`);
  }

  // Load and parse credentials
  const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
  const credentials = JSON.parse(credentialsContent);

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(credentials),
    projectId: credentials.project_id || process.env.FIREBASE_PROJECT_ID,
  });

  useFirebase = true;
  console.log('✅ Firebase initialized successfully with project:', credentials.project_id);
} catch (error) {
  console.warn('⚠️ Firebase initialization warning:', error.message);
  console.warn('📝 Falling back to in-memory storage for now');
  console.warn('💡 To use Firebase properly, ensure firebase-credentials.json exists in reporter-backend folder');
  useFirebase = false;
}

// Get Firestore instance (or create mock for fallback)
let db;

if (useFirebase && firebaseApp) {
  db = admin.firestore();
  db.settings({
    ignoreUndefinedProperties: true,
  });
  console.log('🗄️ Using Firestore (Cloud Database)');
} else {
  console.log('🗄️ Using in-memory storage (data will not persist)');
  db = createMockFirestore();
}

function createMockFirestore() {
  const collections = {};
  
  return {
    collection: (name) => {
      if (!collections[name]) {
        collections[name] = new Map();
      }
      return {
        doc: (id) => ({
          set: async (data) => {
            if (!collections[name]) collections[name] = new Map();
            collections[name].set(id, { ...data, id });
          },
          get: async () => ({
            exists: collections[name]?.has(id),
            data: () => collections[name]?.get(id),
          }),
          update: async (data) => {
            if (collections[name]?.has(id)) {
              const existing = collections[name].get(id);
              collections[name].set(id, { ...existing, ...data });
            }
          },
          delete: async () => {
            collections[name]?.delete(id);
          },
        }),
        where: (field, op, value) => ({
          where: (field2, op2, value2) => ({
            limit: (n) => ({
              get: async () => ({
                empty: true,
                docs: [],
              }),
            }),
            get: async () => ({
              empty: true,
              docs: [],
            }),
          }),
          limit: (n) => ({
            get: async () => ({
              empty: collections[name].size === 0,
              docs: Array.from(collections[name].values()).slice(0, n).map(doc => ({
                data: () => doc,
              })),
            }),
          }),
          orderBy: (field2, direction) => ({
            limit: (n) => ({
              get: async () => ({
                empty: collections[name].size === 0,
                docs: Array.from(collections[name].values()).slice(0, n).map(doc => ({
                  data: () => doc,
                })),
              }),
            }),
            get: async () => ({
              empty: collections[name].size === 0,
              docs: Array.from(collections[name].values()).map(doc => ({
                data: () => doc,
              })),
            }),
          }),
          get: async () => ({
            empty: collections[name].size === 0,
            docs: Array.from(collections[name].values()).map(doc => ({
              data: () => doc,
            })),
          }),
        }),
        orderBy: (field, direction) => ({
          limit: (n) => ({
            get: async () => ({
              empty: collections[name].size === 0,
              docs: Array.from(collections[name].values()).slice(0, n).map(doc => ({
                data: () => doc,
              })),
            }),
          }),
          get: async () => ({
            empty: collections[name].size === 0,
            docs: Array.from(collections[name].values()).map(doc => ({
              data: () => doc,
            })),
          }),
        }),
        get: async () => ({
          empty: collections[name].size === 0,
          docs: Array.from(collections[name].values()).map(doc => ({
            data: () => doc,
          })),
        }),
      };
    },
    settings: () => {},
  };
}

export { useFirebase, db };
export default firebaseApp;
