package com.example.tests;

import com.example.reporting.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.ITestContext;
import org.testng.annotations.Test;

import java.time.Duration;

public class InvalidLoginNegativeSuite extends BaseTest {

    private String getRunId(ITestContext context) {
        return (String) context.getAttribute("runId");
    }

    private String getTestCaseId(ITestContext context) {
        return (String) context.getAttribute("testCaseId");
    }

    @Test(groups = {"negative", "regression"})
    public void invalidLoginShouldIntentionallyFail(ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get("https://the-internet.herokuapp.com/login");
        reporterClient.logStep(runId, testCaseId, "Open login page", "PASS", captureScreenshotBase64(), null);

        wait.until(ExpectedConditions.presenceOfElementLocated(By.id("username")));
        driver.findElement(By.id("username")).sendKeys("invalid-user");
        driver.findElement(By.id("password")).sendKeys("invalid-password");
        reporterClient.logStep(runId, testCaseId, "Enter invalid credentials", "PASS", captureScreenshotBase64(), null);

        driver.findElement(By.cssSelector("button[type='submit']")).click();
        reporterClient.logStep(runId, testCaseId, "Submit invalid login", "PASS", captureScreenshotBase64(), null);

        WebElement flash = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("flash")));
        boolean successMessage = flash.getText().toLowerCase().contains("you logged into a secure area!");
        reporterClient.logStep(runId, testCaseId, "Intentionally assert success text", successMessage ? "PASS" : "FAIL", captureScreenshotBase64(), null);

        Assert.assertTrue(successMessage, "Intentional negative case: asserting success on invalid login");
    }
}
