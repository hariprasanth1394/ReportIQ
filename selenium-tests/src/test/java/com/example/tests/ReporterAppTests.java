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

/**
 * Tests for the Reporter application UI/UX
 * Tests login, navigation, RBAC enforcement, and dashboard functionality
 */
public class ReporterAppTests extends BaseTest {

    private String getRunId(ITestContext context) {
        return (String) context.getAttribute("runId");
    }

    private String getTestCaseId(ITestContext context) {
        return (String) context.getAttribute("testCaseId");
    }

    private static final String APP_URL = "http://localhost:5173";

    @Test(groups = {"P1", "Smoke", "UI"})
    public void loginPageDisplaysCorrectly(ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get(APP_URL + "/login");
        reporterClient.logStep(runId, testCaseId, "Navigate to login page", "PASS", captureScreenshotBase64(), null);

        WebElement emailField = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//input[@label='Email']")));
        Assert.assertNotNull(emailField, "Email field should be visible");
        reporterClient.logStep(runId, testCaseId, "Email field visible", "PASS", captureScreenshotBase64(), null);

        WebElement passwordField = driver.findElement(By.xpath("//input[@type='password']"));
        Assert.assertNotNull(passwordField, "Password field should be visible");
        reporterClient.logStep(runId, testCaseId, "Password field visible", "PASS", captureScreenshotBase64(), null);

        WebElement signInButton = driver.findElement(By.xpath("//button[contains(text(), 'Sign In')]"));
        Assert.assertNotNull(signInButton, "Sign In button should be visible");
        reporterClient.logStep(runId, testCaseId, "Sign In button visible", "PASS", captureScreenshotBase64(), null);
    }

    @Test(groups = {"P1", "Smoke", "UI"})
    public void superAdminCanLoginSuccessfully(ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get(APP_URL + "/login");
        reporterClient.logStep(runId, testCaseId, "Navigate to login page", "PASS", captureScreenshotBase64(), null);

        WebElement emailField = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//input[@label='Email']")));
        emailField.sendKeys("Hariprasanthtest@gmail.com");
        reporterClient.logStep(runId, testCaseId, "Enter super admin email", "PASS", captureScreenshotBase64(), null);

        WebElement passwordField = driver.findElement(By.xpath("//input[@type='password']"));
        passwordField.sendKeys("Inferno0!");
        reporterClient.logStep(runId, testCaseId, "Enter password", "PASS", captureScreenshotBase64(), null);

        WebElement signInButton = driver.findElement(By.xpath("//button[contains(text(), 'Sign In')]"));
        signInButton.click();
        reporterClient.logStep(runId, testCaseId, "Click Sign In", "PASS", captureScreenshotBase64(), null);

        WebElement dashboard = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//h5[contains(text(), 'Test Execution')]")));
        Assert.assertNotNull(dashboard, "Dashboard should be visible after login");
        reporterClient.logStep(runId, testCaseId, "Dashboard loaded", "PASS", captureScreenshotBase64(), null);
    }

    @Test(groups = {"P1", "Smoke", "UI"})
    public void invalidCredentialsShowsError(ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get(APP_URL + "/login");
        reporterClient.logStep(runId, testCaseId, "Navigate to login page", "PASS", captureScreenshotBase64(), null);

        WebElement emailField = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//input[@label='Email']")));
        emailField.sendKeys("invalid@example.com");
        reporterClient.logStep(runId, testCaseId, "Enter invalid email", "PASS", captureScreenshotBase64(), null);

        WebElement passwordField = driver.findElement(By.xpath("//input[@type='password']"));
        passwordField.sendKeys("wrongpassword");
        reporterClient.logStep(runId, testCaseId, "Enter wrong password", "PASS", captureScreenshotBase64(), null);

        WebElement signInButton = driver.findElement(By.xpath("//button[contains(text(), 'Sign In')]"));
        signInButton.click();
        reporterClient.logStep(runId, testCaseId, "Click Sign In", "PASS", captureScreenshotBase64(), null);

        WebElement errorAlert = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//div[contains(@class, 'MuiAlert')]")));
        String errorText = errorAlert.getText();
        boolean hasError = errorText.toLowerCase().contains("invalid") || errorText.toLowerCase().contains("failed");
        reporterClient.logStep(runId, testCaseId, "Error message displayed", hasError ? "PASS" : "FAIL", captureScreenshotBase64(), null);
        Assert.assertTrue(hasError, "Error message should be displayed for invalid credentials");
    }

    @Test(groups = {"P1", "Smoke", "UI"})
    public void superAdminCanAccessUsersTab(ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        // Login as super admin
        driver.get(APP_URL + "/login");
        wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//input[@label='Email']"))).sendKeys("Hariprasanthtest@gmail.com");
        driver.findElement(By.xpath("//input[@type='password']")).sendKeys("Inferno0!");
        driver.findElement(By.xpath("//button[contains(text(), 'Sign In')]")).click();
        reporterClient.logStep(runId, testCaseId, "Super admin logged in", "PASS", captureScreenshotBase64(), null);

        wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//h5[contains(text(), 'Test Execution')]")));
        reporterClient.logStep(runId, testCaseId, "Dashboard loaded", "PASS", captureScreenshotBase64(), null);

        WebElement usersLink = driver.findElement(By.xpath("//a[contains(text(), 'Users')]"));
        Assert.assertNotNull(usersLink, "Users link should be visible for super admin");
        reporterClient.logStep(runId, testCaseId, "Users link visible", "PASS", captureScreenshotBase64(), null);

        usersLink.click();
        reporterClient.logStep(runId, testCaseId, "Navigate to Users page", "PASS", captureScreenshotBase64(), null);

        WebElement usersPageHeader = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//h5[contains(text(), 'Users')]")));
        Assert.assertNotNull(usersPageHeader, "Users page header should be visible");
        reporterClient.logStep(runId, testCaseId, "Users page loaded", "PASS", captureScreenshotBase64(), null);
    }

    @Test(groups = {"P1", "Regression", "UI"})
    public void usersPageHasAddUserButton(ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get(APP_URL + "/login");
        wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//input[@label='Email']"))).sendKeys("Hariprasanthtest@gmail.com");
        driver.findElement(By.xpath("//input[@type='password']")).sendKeys("Inferno0!");
        driver.findElement(By.xpath("//button[contains(text(), 'Sign In')]")).click();
        reporterClient.logStep(runId, testCaseId, "Logged in as super admin", "PASS", captureScreenshotBase64(), null);

        wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//h5[contains(text(), 'Test Execution')]")));
        driver.findElement(By.xpath("//a[contains(text(), 'Users')]")).click();
        reporterClient.logStep(runId, testCaseId, "Navigate to Users page", "PASS", captureScreenshotBase64(), null);

        WebElement addUserButton = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//button[contains(text(), 'Add User')]")));
        Assert.assertNotNull(addUserButton, "Add User button should be visible");
        reporterClient.logStep(runId, testCaseId, "Add User button visible", "PASS", captureScreenshotBase64(), null);

        addUserButton.click();
        reporterClient.logStep(runId, testCaseId, "Click Add User button", "PASS", captureScreenshotBase64(), null);

        WebElement dialogTitle = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//h2[contains(text(), 'Add User')]")));
        Assert.assertNotNull(dialogTitle, "Add User dialog should appear");
        reporterClient.logStep(runId, testCaseId, "Add User dialog displayed", "PASS", captureScreenshotBase64(), null);
    }

    @Test(groups = {"P2", "UI"})
    public void dashboardDisplaysExecutionRuns(ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get(APP_URL + "/login");
        wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//input[@label='Email']"))).sendKeys("Hariprasanthtest@gmail.com");
        driver.findElement(By.xpath("//input[@type='password']")).sendKeys("Inferno0!");
        driver.findElement(By.xpath("//button[contains(text(), 'Sign In')]")).click();
        reporterClient.logStep(runId, testCaseId, "Logged in", "PASS", captureScreenshotBase64(), null);

        WebElement dashboardTable = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//table")));
        Assert.assertNotNull(dashboardTable, "Dashboard table should be visible");
        reporterClient.logStep(runId, testCaseId, "Execution runs table visible", "PASS", captureScreenshotBase64(), null);

        WebElement tableHeader = driver.findElement(By.xpath("//table//th[contains(text(), 'Browser')]"));
        Assert.assertNotNull(tableHeader, "Table headers should be present");
        reporterClient.logStep(runId, testCaseId, "Table headers displayed", "PASS", captureScreenshotBase64(), null);
    }

    @Test(groups = {"P2", "UI"})
    public void navigationBarShowsUserRole(ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get(APP_URL + "/login");
        wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//input[@label='Email']"))).sendKeys("Hariprasanthtest@gmail.com");
        driver.findElement(By.xpath("//input[@type='password']")).sendKeys("Inferno0!");
        driver.findElement(By.xpath("//button[contains(text(), 'Sign In')]")).click();
        reporterClient.logStep(runId, testCaseId, "Logged in", "PASS", captureScreenshotBase64(), null);

        WebElement roleChip = wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//div[contains(text(), 'SUPER_ADMIN')]")));
        Assert.assertNotNull(roleChip, "Role should be displayed in navbar");
        reporterClient.logStep(runId, testCaseId, "User role displayed in navbar", "PASS", captureScreenshotBase64(), null);
    }

    @Test(groups = {"P1", "Smoke", "UI"})
    public void userCanLogout(ITestContext context) {
        String runId = getRunId(context);
        String testCaseId = getTestCaseId(context);
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

        driver.get(APP_URL + "/login");
        wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//input[@label='Email']"))).sendKeys("Hariprasanthtest@gmail.com");
        driver.findElement(By.xpath("//input[@type='password']")).sendKeys("Inferno0!");
        driver.findElement(By.xpath("//button[contains(text(), 'Sign In')]")).click();
        reporterClient.logStep(runId, testCaseId, "Logged in", "PASS", captureScreenshotBase64(), null);

        wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//h5[contains(text(), 'Test Execution')]")));
        reporterClient.logStep(runId, testCaseId, "Dashboard loaded", "PASS", captureScreenshotBase64(), null);

        WebElement logoutButton = driver.findElement(By.xpath("//button[contains(text(), 'Logout')]"));
        logoutButton.click();
        reporterClient.logStep(runId, testCaseId, "Click Logout", "PASS", captureScreenshotBase64(), null);

        wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//h4[contains(text(), 'Welcome back')]")));
        reporterClient.logStep(runId, testCaseId, "Redirected to login page", "PASS", captureScreenshotBase64(), null);
    }
}
