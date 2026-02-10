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

public class SampleTests extends BaseTest {

    private String getRunId(ITestContext context) {
        return (String) context.getAttribute("runId");
    }

    private String getTestCaseId(ITestContext context) {
        return (String) context.getAttribute("testCaseId");
    }

    @Test(groups = {"P1", "Smoke"})
    public void successfulLoginShowsSecureArea(ITestContext context) {
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

        WebElement flash = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("flash")));
        boolean success = flash.getText().toLowerCase().contains("you logged into a secure area!");
        reporterClient.logStep(runId, testCaseId, "Verify success message", success ? "PASS" : "FAIL", captureScreenshotBase64(), null);
        Assert.assertTrue(success, "Expected success alert after login");
    }

    @Test(groups = {"P1", "Smoke"})
    public void invalidLoginShowsError(ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get("https://the-internet.herokuapp.com/login");
        reporterClient.logStep(runId, testCaseId, "Open login page", "PASS", captureScreenshotBase64(), null);

        wait.until(ExpectedConditions.presenceOfElementLocated(By.id("username")));
        driver.findElement(By.id("username")).sendKeys("tomsmith");
        driver.findElement(By.id("password")).sendKeys("bad-password");
        reporterClient.logStep(runId, testCaseId, "Enter invalid credentials", "PASS", captureScreenshotBase64(), null);

        driver.findElement(By.cssSelector("button[type='submit']")).click();
        reporterClient.logStep(runId, testCaseId, "Submit login", "PASS", captureScreenshotBase64(), null);

        WebElement flash = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("flash")));
        boolean hasError = flash.getText().toLowerCase().contains("your password is invalid!");
        reporterClient.logStep(runId, testCaseId, "Verify error message", hasError ? "PASS" : "FAIL", captureScreenshotBase64(), null);
        Assert.assertTrue(hasError, "Expected error alert after invalid login");
    }

    @Test(groups = {"P1", "Regression"})
    public void checkboxCanBeToggled(ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get("https://the-internet.herokuapp.com/checkboxes");
        reporterClient.logStep(runId, testCaseId, "Open checkboxes page", "PASS", captureScreenshotBase64(), null);

        WebElement first = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//form[@id='checkboxes']//input[1]")));
        boolean initial = first.isSelected();
        first.click();
        boolean toggled = first.isSelected() != initial;
        reporterClient.logStep(runId, testCaseId, "Toggle first checkbox", toggled ? "PASS" : "FAIL", captureScreenshotBase64(), null);
        Assert.assertTrue(toggled, "Checkbox state should change after click");
    }

    @Test(groups = {"P2", "Regression"})
    public void dropdownSelectsCorrectOption(ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get("https://the-internet.herokuapp.com/dropdown");
        reporterClient.logStep(runId, testCaseId, "Open dropdown page", "PASS", captureScreenshotBase64(), null);

        WebElement dropdown = wait.until(ExpectedConditions.presenceOfElementLocated(By.id("dropdown")));
        dropdown.click();
        reporterClient.logStep(runId, testCaseId, "Click dropdown", "PASS", captureScreenshotBase64(), null);

        WebElement option2 = driver.findElement(By.xpath("//select[@id='dropdown']//option[@value='2']"));
        option2.click();
        reporterClient.logStep(runId, testCaseId, "Select option 2", "PASS", captureScreenshotBase64(), null);

        boolean selected = option2.isSelected();
        reporterClient.logStep(runId, testCaseId, "Verify selection", selected ? "PASS" : "FAIL", captureScreenshotBase64(), null);
        Assert.assertTrue(selected, "Option 2 should be selected");
    }

    @Test(groups = {"P2", "Smoke"})
    public void dynamicLoadingWaitsForElement(ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(15));

        driver.get("https://the-internet.herokuapp.com/dynamic_loading/2");
        reporterClient.logStep(runId, testCaseId, "Open dynamic loading page", "PASS", captureScreenshotBase64(), null);

        WebElement startButton = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[text()='Start']")));
        startButton.click();
        reporterClient.logStep(runId, testCaseId, "Click Start button", "PASS", captureScreenshotBase64(), null);

        WebElement finishedText = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("finish")));
        boolean finished = finishedText.getText().contains("Hello World!");
        reporterClient.logStep(runId, testCaseId, "Wait for element and verify", finished ? "PASS" : "FAIL", captureScreenshotBase64(), null);
        Assert.assertTrue(finished, "Should display 'Hello World!' after loading");
    }
}
