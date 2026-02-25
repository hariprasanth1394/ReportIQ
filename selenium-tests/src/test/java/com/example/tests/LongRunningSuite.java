package com.example.tests;

import com.example.reporting.BaseTest;
import org.testng.Assert;
import org.testng.ITestContext;
import org.testng.annotations.Test;

public class LongRunningSuite extends BaseTest {

    private String getRunId(ITestContext context) {
        return (String) context.getAttribute("runId");
    }

    private String getTestCaseId(ITestContext context) {
        return (String) context.getAttribute("testCaseId");
    }

    @Test(groups = {"regression"})
    public void longRunningValidation(ITestContext context) throws InterruptedException {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);

        reporterClient.logStep(runId, testCaseId, "Start long running wait", "PASS", captureScreenshotBase64(), null);
        Thread.sleep(10000);
        reporterClient.logStep(runId, testCaseId, "Complete long wait", "PASS", captureScreenshotBase64(), null);

        Assert.assertTrue(true, "Long running suite should pass after sleep");
    }
}
