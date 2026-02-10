package com.example.reporting;

import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.UUID;

public class ReporterListener implements ITestListener {

    @Override
    public void onTestStart(ITestResult result) {
        ITestContext ctx = result.getTestContext();
        ReporterClient client = (ReporterClient) ctx.getAttribute("reporterClient");
        String runId = (String) ctx.getAttribute("runId");
        String testName = result.getMethod().getMethodName();
        String testCaseId = UUID.randomUUID().toString();
        ctx.setAttribute("testCaseId", testCaseId);
        System.out.println("[ReporterListener] onTestStart: runId=" + runId + ", testName=" + testName + ", testCaseId=" + testCaseId);
        if (client != null && runId != null) {
            client.startTestCase(runId, testCaseId, testName);
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
            System.out.println("[ReporterListener] onFinish: finishing runId=" + runId);
            client.finishRun(runId);
        }
    }
}
