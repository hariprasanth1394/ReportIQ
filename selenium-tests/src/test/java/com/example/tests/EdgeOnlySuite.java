package com.example.tests;

import com.example.reporting.BaseTest;
import org.testng.Assert;
import org.testng.ITestContext;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;
import org.testng.annotations.Test;

public class EdgeOnlySuite extends BaseTest {

    private String getRunId(ITestContext context) {
        return (String) context.getAttribute("runId");
    }

    private String getTestCaseId(ITestContext context) {
        return (String) context.getAttribute("testCaseId");
    }

    @Test(groups = {"edge", "regression"})
    @Parameters("browser")
    public void edgeOnlyValidation(@Optional("edge") String browser, ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);

        reporterClient.logStep(runId, testCaseId, "Validate browser is Edge", "PASS", captureScreenshotBase64(), null);
        Assert.assertTrue(browser.equalsIgnoreCase("edge"), "EdgeOnlySuite must run with browser=edge");

        driver.get("https://demoqa.com/buttons");
        reporterClient.logStep(runId, testCaseId, "Open DemoQA buttons in Edge", "PASS", captureScreenshotBase64(), null);
        Assert.assertTrue(driver.getTitle().toLowerCase().contains("demoqa"), "Expected DemoQA title in Edge run");
    }
}
