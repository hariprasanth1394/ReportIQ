package com.example.reporting;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.edge.EdgeDriver;
import org.testng.ITestContext;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.UUID;

public abstract class BaseTest {
    protected static ThreadLocal<WebDriver> driverThread = new ThreadLocal<>();
    protected static ThreadLocal<ReporterClient> reporterClientThread = new ThreadLocal<>();
    protected static ThreadLocal<String> executionIdThread = new ThreadLocal<>();
    protected static String sharedRunId = null;
    protected static Object runIdLock = new Object();
    protected static String sharedToken = null;
    protected static Object tokenLock = new Object();

    protected WebDriver driver;
    protected ReporterClient reporterClient;
    protected String executionId;

    private static String getAuthToken(String apiBase) throws IOException, InterruptedException {
        String email = System.getProperty("reporter.email", "Hariprasanthtest@gmail.com");
        String password = System.getProperty("reporter.password", "Inferno0!");
        
        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
        JsonObject loginBody = new JsonObject();
        loginBody.addProperty("username", email);
        loginBody.addProperty("password", password);
        
        String json = loginBody.toString();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiBase + "/api/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                .timeout(Duration.ofSeconds(10))
                .build();
        
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            Gson gson = new Gson();
            JsonObject result = gson.fromJson(response.body(), JsonObject.class);
            return result.get("token").getAsString();
        }
        throw new IOException("Failed to authenticate: " + response.statusCode());
    }

    @Parameters({"browser"})
    @BeforeMethod(alwaysRun = true)
    public void setUp(@Optional("chrome") String browser, ITestContext context) {
        if (browser != null && browser.equalsIgnoreCase("chrome")) {
            this.driver = new ChromeDriver();
        } else if (browser != null && browser.equalsIgnoreCase("edge")) {
            this.driver = new EdgeDriver();
        } else {
            this.driver = new ChromeDriver();
        }
        this.driver.manage().window().maximize();
        driverThread.set(this.driver);
        
        this.executionId = UUID.randomUUID().toString();
        executionIdThread.set(this.executionId);
        
        String apiBase = System.getProperty("reporter.api", "http://localhost:4000");
        String token;
        try {
            // Get auth token once for entire test suite (thread-safe)
            synchronized (tokenLock) {
                if (sharedToken == null) {
                    sharedToken = getAuthToken(apiBase);
                    System.out.println("[BaseTest] Authenticated successfully. Token: " + sharedToken.substring(0, 20) + "...");
                }
            }
            token = sharedToken;
        } catch (Exception e) {
            System.err.println("[BaseTest] Authentication failed: " + e.getMessage());
            e.printStackTrace();
            token = "";
        }
        
        this.reporterClient = new ReporterClient(apiBase, token);
        reporterClientThread.set(this.reporterClient);
        
        // Generate runId once for entire test suite (thread-safe with static lock)
        synchronized (runIdLock) {
            if (sharedRunId == null) {
                sharedRunId = UUID.randomUUID().toString();
                if (reporterClient != null) {
                    String tags = System.getProperty("test.tags", "");
                    String[] tagArray = tags.isBlank() ? new String[0] : tags.split(",");
                    reporterClient.startRunWithTags(sharedRunId, browser, tagArray);
                    System.out.println("[BaseTest] setUp: Generated and started sharedRunId=" + sharedRunId + " with tags=" + tags);
                }
            }
        }
        
        // Store shared runId in context for test access
        context.setAttribute("runId", sharedRunId);
        
        System.out.println("[BaseTest-" + Thread.currentThread().getId() + "] setUp: executionId=" + executionId + ", browser=" + browser + ", runId=" + sharedRunId + ", api=" + apiBase);
        context.setAttribute("driver", this.driver);
        context.setAttribute("reporterClient", this.reporterClient);
        context.setAttribute("executionId", this.executionId);
        context.setAttribute("browserName", browser);
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
        driverThread.remove();
        reporterClientThread.remove();
        executionIdThread.remove();
    }

    protected String captureScreenshotBase64() {
        if (driver == null) return null;
        try {
            return ((TakesScreenshot) driver).getScreenshotAs(OutputType.BASE64);
        } catch (Exception e) {
            System.err.println("Failed to capture screenshot: " + e.getMessage());
            return null;
        }
    }
}
