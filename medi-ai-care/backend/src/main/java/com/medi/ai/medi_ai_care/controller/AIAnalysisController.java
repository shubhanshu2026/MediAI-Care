package com.medi.ai.medi_ai_care.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AIAnalysisController {

    @PostMapping("/diagnose")
public ResponseEntity<Object> analyze(@RequestBody Map<String, String> request) {
    RestTemplate restTemplate = new RestTemplate();
    String pythonUrl = "http://localhost:5000/predict";

    try {
        Map<String, Object> pyRes = restTemplate.postForObject(pythonUrl, request, Map.class);

        // Package everything for React
        Map<String, Object> response = new HashMap<>();
        response.put("possibleDisease", pyRes.get("disease"));
        response.put("description", pyRes.get("description"));
        response.put("precautions", pyRes.get("precautions"));
        response.put("medications", pyRes.get("medications"));
        response.put("diet", pyRes.get("diet"));
        response.put("workout", pyRes.get("workout"));
        // Default values for UI components
        response.put("recommendedSpecialist", "General Physician");
        response.put("severity", "Medium");

        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.status(503).body(Map.of("message", "AI Service Connection Failed"));
    }
}
}