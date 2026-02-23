# Database Cleanup

To clear the execution runs database and start fresh with new test runs:

## Using the Clear Database Script

### Prerequisites
Ensure `firebase-admin` is installed:
```bash
npm install firebase-admin
```

### Run the cleanup script
From the `reporter-backend` directory:

```bash
node scripts/clearDatabase.js
```

This will:
- Delete all documents from the `executionRuns` collection
- Delete all documents from the `testCases` collection  
- Delete all documents from the `steps` collection

### Output
```
Starting database cleanup...

Clearing collection "executionRuns" (X documents)...
✓ Successfully cleared X documents from "executionRuns"
Clearing collection "testCases" (X documents)...
✓ Successfully cleared X documents from "testCases"
Clearing collection "steps" (X documents)...
✓ Successfully cleared X documents from "steps"

✓ Database cleared successfully!
All execution runs, test cases, and steps have been deleted.
You can now run new test executions.
```

## After Clearing

1. Navigate to the frontend application
2. Run your Selenium tests to create new execution runs
3. The ExecutionRunsPage will display the new runs with matching backend data
4. Clicking on a run will no longer return 404 errors

## Manual Firestore Console Cleanup (Alternative)

If you prefer to use the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database (left sidebar)
4. For each collection (`executionRuns`, `testCases`, `steps`):
   - Click the collection name
   - Select all documents (if any exist)
   - Click "Delete" at the bottom
   - Confirm the deletion

---

**Note:** The database clearing is safe and completely reversible. You can run this script as many times as needed when starting a new testing cycle.
