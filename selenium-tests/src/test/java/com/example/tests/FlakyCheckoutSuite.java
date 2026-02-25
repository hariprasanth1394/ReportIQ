package com.example.tests;

import com.example.reporting.BaseTest;
import org.testng.Assert;
import org.testng.ITestContext;
import org.testng.annotations.Test;

public class FlakyCheckoutSuite extends BaseTest {

    private String getRunId(ITestContext context) {
        return (String) context.getAttribute("runId");
    }

    private String getTestCaseId(ITestContext context) {
        return (String) context.getAttribute("testCaseId");
    }

    @Test(groups = {"flaky", "critical"})
    public void flakyButtonInteraction(ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);

        driver.get("https://demoqa.com/buttons");
        reporterClient.logStep(runId, testCaseId, "Open DemoQA buttons page", "PASS", captureScreenshotBase64(), null);

        if (Math.random() > 0.5) {
            reporterClient.logStep(runId, testCaseId, "Random branch selected PASS", "PASS", captureScreenshotBase64(), null);
            Assert.assertTrue(true);
        } else {
            reporterClient.logStep(runId, testCaseId, "Random branch selected FAIL", "FAIL", captureScreenshotBase64(), null);
            Assert.assertTrue(false);
        }
    }
}
