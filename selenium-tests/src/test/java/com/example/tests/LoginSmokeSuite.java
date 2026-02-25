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

public class LoginSmokeSuite extends BaseTest {

    private String getRunId(ITestContext context) {
        return (String) context.getAttribute("runId");
    }

    private String getTestCaseId(ITestContext context) {
        return (String) context.getAttribute("testCaseId");
    }

    @Test(groups = {"smoke", "positive"})
    public void validLoginShouldPass(ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get("https://the-internet.herokuapp.com/login");
        reporterClient.logStep(runId, testCaseId, "Open login page", "PASS", captureScreenshotBase64(), null);

        wait.until(ExpectedConditions.presenceOfElementLocated(By.id("username")));
        driver.findElement(By.id("username")).sendKeys("tomsmith");
        driver.findElement(By.id("password")).sendKeys("SuperSecretPassword!");
        reporterClient.logStep(runId, testCaseId, "Enter valid credentials", "PASS", captureScreenshotBase64(), null);

        driver.findElement(By.cssSelector("button[type='submit']")).click();
        reporterClient.logStep(runId, testCaseId, "Submit login", "PASS", captureScreenshotBase64(), null);

        WebElement flash = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("flash")));
        boolean success = flash.getText().toLowerCase().contains("you logged into a secure area!");
        reporterClient.logStep(runId, testCaseId, "Validate secure area message", success ? "PASS" : "FAIL", captureScreenshotBase64(), null);

        Assert.assertTrue(success, "Expected successful login confirmation");
    }
}
