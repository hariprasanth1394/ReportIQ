package com.example.reporting;

import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

public class ReporterListener implements ITestListener {
    private final AtomicInteger passedCount = new AtomicInteger(0);
    private final AtomicInteger failedCount = new AtomicInteger(0);
    private final AtomicInteger totalCount = new AtomicInteger(0);

    @Override
    public void onStart(ITestContext context) {
        passedCount.set(0);
        failedCount.set(0);
        totalCount.set(0);
        System.out.println("Execution started - RUNNING");
    }

    @Override
    public void onTestStart(ITestResult result) {
        ITestContext ctx = result.getTestContext();
        ReporterClient client = (ReporterClient) ctx.getAttribute("reporterClient");
        String runId = (String) ctx.getAttribute("runId");
        String testName = result.getMethod().getMethodName();
        String[] groups = result.getMethod().getGroups();
        List<String> tags = groups != null && groups.length > 0 ? Arrays.asList(groups) : List.of("default");
        System.out.println("Test Groups: " + Arrays.toString(groups));
        totalCount.incrementAndGet();
        String testCaseId = UUID.randomUUID().toString();
        ctx.setAttribute("testCaseId", testCaseId);
        ctx.setAttribute("testTags", tags);
        System.out.println("[ReporterListener] onTestStart: runId=" + runId + ", testName=" + testName + ", testCaseId=" + testCaseId);
        if (client != null && runId != null) {
            client.startTestCase(runId, testCaseId, testName, tags);
        } else {
            System.err.println("[ReporterListener] onTestStart: Missing client or runId! runId=" + runId);
        }
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        ITestContext ctx = result.getTestContext();
        ReporterClient client = (ReporterClient) ctx.getAttribute("reporterClient");
        String runId = (String) ctx.getAttribute("runId");
        String testCaseId = (String) ctx.getAttribute("testCaseId");
        passedCount.incrementAndGet();
        System.out.println("[ReporterListener] onTestSuccess: runId=" + runId + ", testCaseId=" + testCaseId);
        if (client != null && runId != null && testCaseId != null) {
            client.finishTestCase(runId, testCaseId, "PASS");
        }
    }

    @Override
    public void onTestFailure(ITestResult result) {
        ITestContext ctx = result.getTestContext();
        ReporterClient client = (ReporterClient) ctx.getAttribute("reporterClient");
        String runId = (String) ctx.getAttribute("runId");
        String testCaseId = (String) ctx.getAttribute("testCaseId");
        failedCount.incrementAndGet();
        Object driverObj = ctx.getAttribute("driver");
        String screenshot = null;
        if (driverObj instanceof org.openqa.selenium.TakesScreenshot) {
            try {
                screenshot = ((org.openqa.selenium.TakesScreenshot) driverObj)
                        .getScreenshotAs(org.openqa.selenium.OutputType.BASE64);
            } catch (Exception e) {
                System.err.println("[ReporterListener] Failed to capture screenshot: " + e.getMessage());
            }
        }
        System.out.println("[ReporterListener] onTestFailure: runId=" + runId + ", testCaseId=" + testCaseId);
        if (client != null && runId != null && testCaseId != null) {
            StringWriter sw = new StringWriter();
            result.getThrowable().printStackTrace(new PrintWriter(sw));
            client.logTestCaseError(runId, testCaseId, result.getMethod().getMethodName(), sw.toString(), screenshot);
            client.finishTestCase(runId, testCaseId, "FAIL");
        }
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        ITestContext ctx = result.getTestContext();
        ReporterClient client = (ReporterClient) ctx.getAttribute("reporterClient");
        String runId = (String) ctx.getAttribute("runId");
        String testCaseId = (String) ctx.getAttribute("testCaseId");
        if (client != null && runId != null && testCaseId != null) {
            client.finishTestCase(runId, testCaseId, "SKIPPED");
        }
    }

    @Override
    public void onFinish(ITestContext context) {
        ReporterClient client = (ReporterClient) context.getAttribute("reporterClient");
        String runId = (String) context.getAttribute("runId");
        if (client != null && runId != null) {
            String finalStatus = failedCount.get() > 0 ? "FAILED" : "PASSED";
            System.out.println("[ReporterListener] onFinish: finishing runId=" + runId);
            System.out.println("Execution finished - " + finalStatus);
            client.finishRun(runId, finalStatus);
        }
    }
}
