import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase.js';

const RUNS_COLLECTION = 'executionRuns';
const TEST_CASES_COLLECTION = 'testCases';
const STEPS_COLLECTION = 'steps';

function generateRunId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateShortId(prefix = '') {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix ? `${prefix}${id}` : id;
}

class ExecutionStore {
  async resolveRunDocId(runIdentifier) {
    const byDocId = await db.collection(RUNS_COLLECTION).doc(runIdentifier).get();
    if (byDocId.exists) {
      return byDocId.id;
    }

    const byRunId = await db
      .collection(RUNS_COLLECTION)
      .where('runId', '==', runIdentifier)
      .limit(1)
      .get();

    if (byRunId.empty) {
      return null;
    }

    return byRunId.docs[0].id;
  }

  // Start a new execution run (batch of tests)
  async startRun({ runId, browser, tags, suiteName, environment }) {
    try {
      const id = runId || uuidv4();
      const record = {
        id,
        runId: generateRunId(),
        suiteName: suiteName || 'Execution Suite',
        browser,
        environment: environment || 'Production',
        tags: tags || [],
        status: 'RUNNING',
        startedAt: new Date(),
        finishedAt: null,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        createdAt: new Date(),
      };
      
      await db.collection(RUNS_COLLECTION).doc(id).set(record);
      return record;
    } catch (error) {
      console.error('Error starting run:', error);
      throw error;
    }
  }

  // Start a test case within an execution run
  async startTestCase(runIdentifier, { testCaseId, testName, tags }) {
    try {
      const resolvedRunId = await this.resolveRunDocId(runIdentifier);
      if (!resolvedRunId) return null;

      const run = await db.collection(RUNS_COLLECTION).doc(resolvedRunId).get();
      if (!run.exists) return null;
      const normalizedTags = Array.isArray(tags) && tags.length > 0 ? tags : ['default'];

      // Use provided testCaseId or generate short SaaS-style ID
      const testCaseId_ = testCaseId || generateShortId('TC');
      const testCase = {
        id: testCaseId_,
        runId: resolvedRunId,
        name: testName,
        tags: normalizedTags,
        status: 'RUNNING',
        startedAt: new Date(),
        finishedAt: null,
        steps: [],
        error: null,
        createdAt: new Date(),
      };
      
      await db.collection(TEST_CASES_COLLECTION).doc(testCaseId_).set(testCase);
      
      // Update run total tests count
      const runData = run.data();
      const mergedTags = Array.from(new Set([...(runData.tags || []), ...normalizedTags]));
      await db.collection(RUNS_COLLECTION).doc(resolvedRunId).update({
        totalTests: (runData.totalTests || 0) + 1,
        tags: mergedTags,
      });
      
      return testCase;
    } catch (error) {
      console.error('Error starting test case:', error);
      throw error;
    }
  }

  // Append a step to a test case
  async appendStep(runIdentifier, testCaseId, { stepName, status, screenshot, error }) {
    try {
      const resolvedRunId = await this.resolveRunDocId(runIdentifier);
      if (!resolvedRunId) return null;

      const testCaseDoc = await db.collection(TEST_CASES_COLLECTION).doc(testCaseId).get();
      if (!testCaseDoc.exists) return null;
// Generate short SaaS-style ID for steps
      const stepId = generateShortId('STEP');
      // const stepId = uuidv4();
      const step = {
        id: stepId,
        testCaseId,
        runId: resolvedRunId,
        stepName,
        status,
        screenshot: screenshot || null,
        error: error || null,
        timestamp: new Date(),
        createdAt: new Date(),
      };
      
      await db.collection(STEPS_COLLECTION).doc(stepId).set(step);
      
      // Update test case status if failed
      const testCaseData = testCaseDoc.data();
      if (status === 'FAIL') {
        await db.collection(TEST_CASES_COLLECTION).doc(testCaseId).update({
          status: 'FAIL',
          error: error || testCaseData.error,
        });
      }
      
      return step;
    } catch (error) {
      console.error('Error appending step:', error);
      throw error;
    }
  }

  // Finish a test case
  async finishTestCase(runIdentifier, testCaseId, status) {
    try {
      const resolvedRunId = await this.resolveRunDocId(runIdentifier);
      if (!resolvedRunId) return null;

      const testCaseDoc = await db.collection(TEST_CASES_COLLECTION).doc(testCaseId).get();
      if (!testCaseDoc.exists) return null;

      const finalStatus = status || 'PASS';
      await db.collection(TEST_CASES_COLLECTION).doc(testCaseId).update({
        status: finalStatus,
        finishedAt: new Date(),
      });

      // Update run stats
      const runDoc = await db.collection(RUNS_COLLECTION).doc(resolvedRunId).get();
      const runData = runDoc.data();
      
      const updateData = {};
      if (finalStatus === 'PASS') {
        updateData.passedTests = (runData.passedTests || 0) + 1;
      } else if (finalStatus === 'FAIL') {
        updateData.failedTests = (runData.failedTests || 0) + 1;
      }

      await db.collection(RUNS_COLLECTION).doc(resolvedRunId).update(updateData);
      
      return testCaseDoc.data();
    } catch (error) {
      console.error('Error finishing test case:', error);
      throw error;
    }
  }

  // Finish the execution run
  async finishRun(runIdentifier, status) {
    try {
      const resolvedRunId = await this.resolveRunDocId(runIdentifier);
      if (!resolvedRunId) return null;

      const runDoc = await db.collection(RUNS_COLLECTION).doc(resolvedRunId).get();
      if (!runDoc.exists) return null;

      const runData = runDoc.data();
      const passedTests = Number(runData.passedTests || 0);
      const failedTests = Number(runData.failedTests || 0);
      const finalStatus = status || (failedTests > 0 ? 'FAIL' : 'PASS');
      await db.collection(RUNS_COLLECTION).doc(resolvedRunId).update({
        status: finalStatus,
        finishedAt: new Date(),
      });

      return runDoc.data();
    } catch (error) {
      console.error('Error finishing run:', error);
      throw error;
    }
  }

  // Get a single run
  async getRun(runIdentifier) {
    try {
      const resolvedRunId = await this.resolveRunDocId(runIdentifier);
      if (!resolvedRunId) return null;

      const runDoc = await db.collection(RUNS_COLLECTION).doc(resolvedRunId).get();
      if (!runDoc.exists) return null;

      // Fetch all test cases for this run
      const testCasesSnapshot = await db.collection(TEST_CASES_COLLECTION)
        .where('runId', '==', resolvedRunId)
        .get();

      const testCases = await Promise.all(
        testCasesSnapshot.docs.map(async (testCaseDoc) => {
          const testCaseData = testCaseDoc.data();
          
          // Fetch all steps for this test case (without orderBy to avoid needing index)
          const stepsSnapshot = await db.collection(STEPS_COLLECTION)
            .where('testCaseId', '==', testCaseData.id)
            .get();

          const steps = stepsSnapshot.docs.map(doc => {
            const stepData = doc.data();
            return {
              ...stepData,
              timestamp: stepData.timestamp?.toDate?.()?.toISOString() || stepData.timestamp || null,
              createdAt: stepData.createdAt?.toDate?.()?.toISOString() || stepData.createdAt || null,
            };
          }).sort((a, b) => {
            // Sort in memory instead of using orderBy
            return new Date(a.createdAt) - new Date(b.createdAt);
          });
          
          // Convert test case timestamps
          return {
            ...testCaseData,
            startedAt: testCaseData.startedAt?.toDate?.()?.toISOString() || testCaseData.startedAt || null,
            finishedAt: testCaseData.finishedAt?.toDate?.()?.toISOString() || testCaseData.finishedAt || null,
            createdAt: testCaseData.createdAt?.toDate?.()?.toISOString() || testCaseData.createdAt || null,
            steps,
          };
        })
      );

      const runData = runDoc.data();
      return {
        ...runData,
        startedAt: runData.startedAt?.toDate?.()?.toISOString() || runData.startedAt || null,
        finishedAt: runData.finishedAt?.toDate?.()?.toISOString() || runData.finishedAt || null,
        createdAt: runData.createdAt?.toDate?.()?.toISOString() || runData.createdAt || null,
        testCases,
      };
    } catch (error) {
      console.error('Error getting run:', error);
      throw error;
    }
  }

  // Get a single test case
  async getTestCase(testCaseId) {
    try {
      const testCaseDoc = await db.collection(TEST_CASES_COLLECTION).doc(testCaseId).get();
      if (!testCaseDoc.exists) return null;

      // Fetch all steps for this test case (without orderBy to avoid needing index)
      const stepsSnapshot = await db.collection(STEPS_COLLECTION)
        .where('testCaseId', '==', testCaseId)
        .get();

      const steps = stepsSnapshot.docs.map(doc => {
        const stepData = doc.data();
        return {
          ...stepData,
          timestamp: stepData.timestamp?.toDate?.()?.toISOString() || stepData.timestamp || null,
          createdAt: stepData.createdAt?.toDate?.()?.toISOString() || stepData.createdAt || null,
        };
      }).sort((a, b) => {
        // Sort in memory instead of using orderBy
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      
      const testCaseData = testCaseDoc.data();
      return {
        ...testCaseData,
        startedAt: testCaseData.startedAt?.toDate?.()?.toISOString() || testCaseData.startedAt || null,
        finishedAt: testCaseData.finishedAt?.toDate?.()?.toISOString() || testCaseData.finishedAt || null,
        createdAt: testCaseData.createdAt?.toDate?.()?.toISOString() || testCaseData.createdAt || null,
        steps,
      };
    } catch (error) {
      console.error('Error getting test case:', error);
      throw error;
    }
  }

  // List all runs
  async listRuns(limit = 50) {
    try {
      const runsSnapshot = await db.collection(RUNS_COLLECTION)
        .orderBy('startedAt', 'desc')
        .limit(limit)
        .get();

      // Convert Firestore Timestamps to ISO strings
      return runsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          startedAt: data.startedAt?.toDate?.()?.toISOString() || data.startedAt || null,
          finishedAt: data.finishedAt?.toDate?.()?.toISOString() || data.finishedAt || null,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null,
        };
      });
    } catch (error) {
      console.error('Error listing runs:', error);
      throw error;
    }
  }
}

export const executionStore = new ExecutionStore();

