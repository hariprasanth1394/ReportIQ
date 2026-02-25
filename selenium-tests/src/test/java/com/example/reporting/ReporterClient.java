package com.example.reporting;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ReporterClient {
    private final String baseUrl;
    private final String token;
    private final HttpClient client;
    private final Gson gson;

    public ReporterClient(String baseUrl, String token) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.token = token;
        this.client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        this.gson = new GsonBuilder().create();
    }

    private HttpRequest.Builder request(String path) {
        return HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + token)
                .timeout(Duration.ofSeconds(10));
    }

    private void post(String path, Map<String, Object> body) {
        try {
            String json = gson.toJson(body);
            // Log without screenshot to avoid flooding console
            Map<String, Object> logBody = new HashMap<>(body);
            if (logBody.containsKey("screenshot")) {
                logBody.put("screenshot", "[BASE64_IMAGE]");
            }
            System.out.println("[Reporter] POST " + path + ": " + gson.toJson(logBody));
            HttpRequest request = request(path)
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .build();
            HttpResponse<Void> response = client.send(request, HttpResponse.BodyHandlers.discarding());
            if (response.statusCode() >= 400) {
                System.err.println("[Reporter] Error " + response.statusCode() + " on " + path);
            } else {
                System.out.println("[Reporter] Success " + response.statusCode());
            }
        } catch (Exception e) {
            System.err.println("[Reporter] Request failed: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // New API: run-based
    public void startRun(String runId, String browser) {
        Map<String, Object> body = new HashMap<>();
        body.put("runId", runId);
        body.put("browser", browser);
        post("/api/executions/runs/start", body);
    }

    public void startRunWithTags(String runId, String browser, String[] tags) {
        Map<String, Object> body = new HashMap<>();
        body.put("runId", runId);
        body.put("browser", browser);
        body.put("tags", tags);
        post("/api/executions/runs/start", body);
    }

    public void startTestCase(String runId, String testCaseId, String testName, List<String> tags) {
        Map<String, Object> body = new HashMap<>();
        body.put("testCaseId", testCaseId);
        body.put("testName", testName);
        body.put("tags", tags);
        post("/api/executions/runs/" + runId + "/test-cases/start", body);
    }

    public void logStep(String runId, String testCaseId, String stepName, String status, String screenshotBase64, String error) {
        Map<String, Object> body = new HashMap<>();
        body.put("stepName", stepName);
        body.put("status", status);
        if (screenshotBase64 != null) body.put("screenshot", screenshotBase64);
        if (error != null) body.put("error", error);
        post("/api/executions/runs/" + runId + "/test-cases/" + testCaseId + "/step", body);
    }

    public void logTestCaseError(String runId, String testCaseId, String stepName, String error, String screenshotBase64) {
        Map<String, Object> body = new HashMap<>();
        body.put("stepName", stepName);
        body.put("error", error);
        if (screenshotBase64 != null) body.put("screenshot", screenshotBase64);
        post("/api/executions/runs/" + runId + "/test-cases/" + testCaseId + "/error", body);
    }

    public void finishTestCase(String runId, String testCaseId, String status) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", status);
        post("/api/executions/runs/" + runId + "/test-cases/" + testCaseId + "/finish", body);
    }

    public void finishRun(String runId, String status) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", status);
        post("/api/executions/runs/" + runId + "/finish", body);
    }
}
