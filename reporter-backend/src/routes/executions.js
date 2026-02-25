import express from 'express';
import { executionStore } from '../store/executionStore.js';

const router = express.Router();

// Start a new execution run
router.post('/runs/start', async (req, res) => {
  const { runId, browser, tags, suiteName, environment } = req.body || {};
  if (!browser) {
    return res.status(400).json({ message: 'browser is required' });
  }
  const record = await executionStore.startRun({ runId, browser, tags, suiteName, environment });
  return res.status(201).json(record);
});

// Start a test case within a run
router.post('/runs/:runId/test-cases/start', async (req, res) => {
  const { runId } = req.params;
  const { testCaseId, testName } = req.body || {};
  if (!testName) {
    return res.status(400).json({ message: 'testName is required' });
  }
  const testCase = await executionStore.startTestCase(runId, { testCaseId, testName });
  if (!testCase) return res.status(404).json({ message: 'Run not found' });
  return res.status(201).json(testCase);
});

// Log a step within a test case
router.post('/runs/:runId/test-cases/:testCaseId/step', async (req, res) => {
  const { runId, testCaseId } = req.params;
  const { stepName, status, screenshot, error } = req.body || {};
  if (!stepName || !status) {
    return res.status(400).json({ message: 'stepName and status are required' });
  }
  const step = await executionStore.appendStep(runId, testCaseId, { stepName, status, screenshot, error });
  if (!step) return res.status(404).json({ message: 'Run or test case not found' });
  return res.status(201).json(step);
});

// Log an error for a test case
router.post('/runs/:runId/test-cases/:testCaseId/error', async (req, res) => {
  const { runId, testCaseId } = req.params;
  const { stepName, error, screenshot } = req.body || {};
  const step = await executionStore.appendStep(runId, testCaseId, {
    stepName: stepName || 'Error',
    status: 'FAIL',
    screenshot,
    error,
  });
  if (!step) return res.status(404).json({ message: 'Run or test case not found' });
  await executionStore.finishTestCase(runId, testCaseId, 'FAIL');
  return res.status(201).json(step);
});

// Finish a test case
router.post('/runs/:runId/test-cases/:testCaseId/finish', async (req, res) => {
  const { runId, testCaseId } = req.params;
  const { status } = req.body || {};
  const testCase = await executionStore.finishTestCase(runId, testCaseId, status || 'PASS');
  if (!testCase) return res.status(404).json({ message: 'Run or test case not found' });
  return res.json(testCase);
});

// Finish an execution run
router.post('/runs/:runId/finish', async (req, res) => {
  const { runId } = req.params;
  const { status } = req.body || {};
  const run = await executionStore.finishRun(runId, status || 'PASS');
  if (!run) return res.status(404).json({ message: 'Run not found' });
  return res.json(run);
});

// List all execution runs
router.get('/runs', async (_req, res) => {
  const runs = await executionStore.listRuns();
  return res.json(runs);
});

// Get a specific run with all test cases
router.get('/runs/:runId', async (req, res) => {
  const run = await executionStore.getRun(req.params.runId);
  if (!run) return res.status(404).json({ message: 'Run not found' });
  return res.json(run);
});

// Get a specific test case with steps
router.get('/runs/:runId/test-cases/:testCaseId', async (req, res) => {
  const testCase = await executionStore.getTestCase(req.params.testCaseId);
  if (!testCase) return res.status(404).json({ message: 'Test case not found' });
  return res.json(testCase);
});

export default router;
