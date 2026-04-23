package com.medi.ai.medi_ai_care.controller;

import com.medi.ai.medi_ai_care.dto.VoicePredictRequest;
import com.medi.ai.medi_ai_care.dto.VoicePredictResponse;
import com.medi.ai.medi_ai_care.service.VoicePredictService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * POST /api/voice-predict
 * Accepts raw speech-to-text and returns matched symptoms + disease predictions.
 *
 * PUT THIS FILE IN:
 *   backend/src/main/java/com/medi/ai/medi_ai_care/controller/VoicePredictController.java
 */
@RestController
@RequestMapping("/api/voice-predict")
@CrossOrigin(origins = "*")
public class VoicePredictController {

    @Autowired
    private VoicePredictService voicePredictService;

    @PostMapping
    public ResponseEntity<VoicePredictResponse> predict(@RequestBody VoicePredictRequest request) {
        if (request.getText() == null || request.getText().isBlank()) {
            return ResponseEntity.badRequest().body(
                VoicePredictResponse.builder()
                    .error("No text provided. Please speak clearly and try again.")
                    .build()
            );
        }

        VoicePredictResponse response = voicePredictService.predict(request.getText());
        return ResponseEntity.ok(response);
    }
}