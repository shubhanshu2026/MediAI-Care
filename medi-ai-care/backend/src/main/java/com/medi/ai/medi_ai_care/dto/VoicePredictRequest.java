package com.medi.ai.medi_ai_care.dto;

import lombok.Data;

/**
 * PUT THIS FILE IN:
 *   backend/src/main/java/com/medi/ai/medi_ai_care/dto/VoicePredictRequest.java
 */
@Data
public class VoicePredictRequest {
    /**
     * Raw speech-to-text transcript.
     * Example: "I have fever and headache and I feel dizzy"
     */
    private String text;
}