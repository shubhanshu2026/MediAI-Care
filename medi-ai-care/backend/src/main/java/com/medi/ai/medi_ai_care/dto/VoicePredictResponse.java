package com.medi.ai.medi_ai_care.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * PUT THIS FILE IN:
 *   backend/src/main/java/com/medi/ai/medi_ai_care/dto/VoicePredictResponse.java
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoicePredictResponse {

    /** Symptoms extracted from the spoken text */
    private List<String> symptoms;

    /** Top disease predictions with confidence */
    private List<Prediction> predictions;

    /** Set only when an error occurred (e.g. no symptoms detected) */
    private String error;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Prediction {
        private String disease;
        private String confidence;
        private String reason;
    }
}