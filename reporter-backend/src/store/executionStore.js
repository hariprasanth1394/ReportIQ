import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase.js';

const RUNS_COLLECTION = 'executionRuns';
const TEST_CASES_COLLECTION = 'testCases';
const STEPS_COLLECTION = 'steps';

class ExecutionStore {
  // Start a new execution run (batch of tests)
  async startRun({ runId, browser, tags }) {
    try {
      const id = runId || uuidv4();
      const record = {
        id,
        browser,
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
  async startTestCase(runId, { testCaseId, testName }) {
    try {
      const run = await db.collection(RUNS_COLLECTION).doc(runId).get();
      if (!run.exists) return null;

      const testCaseId_ = testCaseId || uuidv4();
      const testCase = {
        id: testCaseId_,
        runId,
        name: testName,
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
      await db.collection(RUNS_COLLECTION).doc(runId).update({
        totalTests: (runData.totalTests || 0) + 1,
      });
      
      return testCase;
    } catch (error) {
      console.error('Error starting test case:', error);
      throw error;
    }
  }

  // Append a step to a test case
  async appendStep(runId, testCaseId, { stepName, status, screenshot, error }) {
    try {
      const testCaseDoc = await db.collection(TEST_CASES_COLLECTION).doc(testCaseId).get();
      if (!testCaseDoc.exists) return null;

      const stepId = uuidv4();
      const step = {
        id: stepId,
        testCaseId,
        runId,
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
  async finishTestCase(runId, testCaseId, status) {
    try {
      const testCaseDoc = await db.collection(TEST_CASES_COLLECTION).doc(testCaseId).get();
      if (!testCaseDoc.exists) return null;

      const finalStatus = status || 'PASS';
      await db.collection(TEST_CASES_COLLECTION).doc(testCaseId).update({
        status: finalStatus,
        finishedAt: new Date(),
      });

      // Update run stats
      const runDoc = await db.collection(RUNS_COLLECTION).doc(runId).get();
      const runData = runDoc.data();
      
      const updateData = {};
      if (finalStatus === 'PASS') {
        updateData.passedTests = (runData.passedTests || 0) + 1;
      } else if (finalStatus === 'FAIL') {
        updateData.failedTests = (runData.failedTests || 0) + 1;
      }

      await db.collection(RUNS_COLLECTION).doc(runId).update(updateData);
      
      return testCaseDoc.data();
    } catch (error) {
      console.error('Error finishing test case:', error);
      throw error;
    }
  }

  // Finish the execution run
  async finishRun(runId, status) {
    try {
      const runDoc = await db.collection(RUNS_COLLECTION).doc(runId).get();
      if (!runDoc.exists) return null;

      const finalStatus = status || 'PASS';
      await db.collection(RUNS_COLLECTION).doc(runId).update({
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
  async getRun(runId) {
    try {
      const runDoc = await db.collection(RUNS_COLLECTION).doc(runId).get();
      if (!runDoc.exists) return null;

      // Fetch all test cases for this run
      const testCasesSnapshot = await db.collection(TEST_CASES_COLLECTION)
        .where('runId', '==', runId)
        .get();

      const testCases = await Promise.all(
        testCasesSnapshot.docs.map(async (testCaseDoc) => {
          const testCaseData = testCaseDoc.data();
          
          // Fetch all steps for this test case (without orderBy to avoid needing index)
          const stepsSnapshot = await db.collection(STEPS_COLLECTION)
            .where('testCaseId', '==', testCaseData.id)
            .get();

          const steps = stepsSnapshot.docs.map(doc => doc.data()).sort((a, b) => {
            // Sort in memory instead of using orderBy
            return new Date(a.createdAt) - new Date(b.createdAt);
          });
          return { ...testCaseData, steps };
        })
      );

      return { ...runDoc.data(), testCases };
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

      const steps = stepsSnapshot.docs.map(doc => doc.data()).sort((a, b) => {
        // Sort in memory instead of using orderBy
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      return { ...testCaseDoc.data(), steps };
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

      return runsSnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error listing runs:', error);
      throw error;
    }
  }
}

export const executionStore = new ExecutionStore();

