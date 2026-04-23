package com.medi.ai.medi_ai_care.service;

import com.medi.ai.medi_ai_care.dto.VoicePredictResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;

import java.util.*;

@Service
public class VoicePredictService {

    @Value("${ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final List<String> SYMPTOM_LIST = Arrays.asList(
        "itching", "skin rash", "nodal skin eruptions", "continuous sneezing",
        "shivering", "chills", "joint pain", "stomach pain", "acidity",
        "ulcers on tongue", "muscle wasting", "vomiting", "burning micturition",
        "spotting urination", "fatigue", "weight gain", "anxiety",
        "cold hands and feets", "mood swings", "weight loss", "restlessness",
        "lethargy", "patches in throat", "irregular sugar level", "cough",
        "high fever", "sunken eyes", "breathlessness", "sweating", "dehydration",
        "indigestion", "headache", "yellowish skin", "dark urine", "nausea",
        "loss of appetite", "pain behind the eyes", "back pain", "constipation",
        "abdominal pain", "diarrhoea", "mild fever", "yellow urine",
        "yellowing of eyes", "acute liver failure", "fluid overload",
        "swelling of stomach", "swelled lymph nodes", "malaise",
        "blurred and distorted vision", "phlegm", "throat irritation",
        "redness of eyes", "sinus pressure", "runny nose", "congestion",
        "chest pain", "weakness in limbs", "fast heart rate",
        "pain during bowel movements", "pain in anal region", "bloody stool",
        "irritation in anus", "neck pain", "dizziness", "cramps", "bruising",
        "obesity", "swollen legs", "swollen blood vessels", "puffy face and eyes",
        "enlarged thyroid", "brittle nails", "swollen extremeties",
        "excessive hunger", "extra marital contacts", "drying and tingling lips",
        "slurred speech", "knee pain", "hip joint pain", "muscle weakness",
        "stiff neck", "swelling joints", "movement stiffness", "spinning movements",
        "loss of balance", "unsteadiness", "weakness of one body side",
        "loss of smell", "bladder discomfort", "foul smell of urine",
        "continuous feel of urine", "passage of gases", "internal itching",
        "toxic look typhos", "depression", "irritability", "muscle pain",
        "altered sensorium", "red spots over body", "belly pain",
        "abnormal menstruation", "dischromic patches", "watering from eyes",
        "increased appetite", "polyuria", "family history", "mucoid sputum",
        "rusty sputum", "lack of concentration", "visual disturbances",
        "receiving blood transfusion", "receiving unsterile injections", "coma",
        "stomach bleeding", "distention of abdomen", "history of alcohol consumption",
        "blood in sputum", "prominent veins on calf", "palpitations",
        "painful walking", "pus filled pimples", "blackheads", "scurring",
        "skin peeling", "silver like dusting", "small dents in nails",
        "inflammatory nails", "blister", "red sore around nose", "yellow crust ooze"
    );

    public VoicePredictResponse predict(String rawText) {
        String normalizedText = rawText.toLowerCase().replaceAll("[^a-z0-9 ]", " ").trim();

        // Step 1: Extract symptoms locally (for showing in UI)
        List<String> detectedSymptoms = extractSymptoms(normalizedText);

        // Step 2: Forward to Python Flask AI service
        try {
            Map<String, String> flaskRequest = new HashMap<>();
            flaskRequest.put("symptoms", rawText);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(flaskRequest, headers);

            // ✅ FIX: Use ParameterizedTypeReference<Map<String, Object>> instead of raw Map.
            // The raw `Map` type caused an unchecked cast — getOrDefault() returned Object
            // instead of String, which caused a compile/runtime ClassCastException.
            ResponseEntity<Map<String, Object>> flaskResponse = restTemplate.exchange(
                aiServiceUrl + "/predict",
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            Map<String, Object> body = flaskResponse.getBody();

            if (body == null || body.containsKey("error")) {
                return VoicePredictResponse.builder()
                    .symptoms(detectedSymptoms)
                    .error("No symptoms recognized from your input. Try speaking more clearly.")
                    .build();
            }

            // ✅ FIX: Safe cast using a helper — body is now Map<String, Object>
            // so getOrDefault works correctly without unchecked warnings.
            String disease = getStringValue(body, "disease", "Unknown");

            VoicePredictResponse.Prediction prediction = VoicePredictResponse.Prediction.builder()
                .disease(disease)
                .confidence(calculateConfidence(detectedSymptoms.size()) + "%")
                .reason("Based on dataset matching: " + String.join(", ", detectedSymptoms))
                .build();

            return VoicePredictResponse.builder()
                .symptoms(detectedSymptoms)
                .predictions(Collections.singletonList(prediction))
                .build();

        } catch (Exception e) {
            System.err.println("AI Service Error: " + e.getMessage());
            return VoicePredictResponse.builder()
                .symptoms(detectedSymptoms)
                .error("AI service is currently unavailable. Please ensure Python Flask (app.py) is running on port 5000.")
                .build();
        }
    }

    /**
     * ✅ FIX: Type-safe helper to read a String value from Map<String, Object>.
     * Replaces the problematic (String) body.getOrDefault("key", "") pattern
     * which caused ClassCastException when the value was not a String.
     */
    private String getStringValue(Map<String, Object> map, String key, String defaultValue) {
        Object value = map.get(key);
        if (value instanceof String) {
            return (String) value;
        }
        return defaultValue;
    }

    private List<String> extractSymptoms(String normalizedText) {
        List<String> found = new ArrayList<>();
        for (String symptom : SYMPTOM_LIST) {
            if (normalizedText.contains(symptom)) {
                found.add(symptom.replace(" ", "_"));
            }
        }
        return found;
    }

    private int calculateConfidence(int symptomCount) {
        if (symptomCount >= 5) return 92;
        if (symptomCount >= 3) return 80;
        if (symptomCount >= 2) return 68;
        return 55;
    }
}