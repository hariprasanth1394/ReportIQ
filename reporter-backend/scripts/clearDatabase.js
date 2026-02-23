import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load firebase credentials
const credentialsPath = path.join(__dirname, '../firebase-credentials.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const db = admin.firestore();

const COLLECTIONS = ['executionRuns', 'testCases', 'steps'];

async function clearCollection(collectionName) {
  try {
    const docs = await db.collection(collectionName).get();
    
    if (docs.empty) {
      console.log(`✓ Collection "${collectionName}" is already empty`);
      return;
    }

    console.log(`Clearing collection "${collectionName}" (${docs.size} documents)...`);
    
    const batch = db.batch();
    docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`✓ Successfully cleared ${docs.size} documents from "${collectionName}"`);
  } catch (error) {
    console.error(`✗ Error clearing collection "${collectionName}":`, error);
    throw error;
  }
}

async function main() {
  try {
    console.log('Starting database cleanup...\n');
    
    for (const collection of COLLECTIONS) {
      await clearCollection(collection);
    }
    
    console.log('\n✓ Database cleared successfully!');
    console.log('All execution runs, test cases, and steps have been deleted.');
    console.log('You can now run new test executions.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Failed to clear database:', error);
    process.exit(1);
  }
}

main();
