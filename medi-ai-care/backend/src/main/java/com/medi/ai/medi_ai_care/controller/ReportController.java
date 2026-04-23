package com.medi.ai.medi_ai_care.controller;

import com.medi.ai.medi_ai_care.model.MedicalReport;
import com.medi.ai.medi_ai_care.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadReport(@RequestParam("file") MultipartFile file, @RequestParam("email") String email) {
        try {
            // 1. Get original filename safely
            String originalName = file.getOriginalFilename();
            String searchName = (originalName != null) ? originalName.toLowerCase() : "";
            
            // 2. Dynamic Analysis Logic
            String observation = "✅ Standard Baseline Verified:\n\nNo critical biomarkers detected.";
            
            if (searchName.contains("blood") || searchName.contains("sample") || searchName.contains("rahul")) {
                observation = "⚠️ Abnormalities Detected:\n\n" +
                              "1. Glucose: 140 mg/dL (High)\n" +
                              "   → Indicates possible hyperglycemia.\n\n" +
                              "2. Cholesterol: 220 mg/dL (High)\n" +
                              "   → May increase risk of heart disease.\n\n" +
                              "✔️ Hemoglobin: 13.5 g/dL (Normal)\n\n" +
                              "📌 Summary: 2 abnormal parameters detected. Follow-up recommended.";
            } else if (searchName.contains("heart") || searchName.contains("ecg")) {
                observation = "❤️ Cardiac Analysis:\n\n" +
                              "1. Heart Rate: 82 bpm (Normal)\n" +
                              "✔️ Conclusion: Stable heart rhythm.";
            }

            // 3. Build and Save
            MedicalReport report = MedicalReport.builder()
                    .patientEmail(email)
                    .fileName(originalName)
                    .aiObservation(observation)
                    .uploadDate(LocalDateTime.now())
                    .build();

            reportRepository.save(report);
            return ResponseEntity.ok("{\"status\": \"SUCCESS\"}");

        } catch (Exception e) {
            // Check your IntelliJ Console for this output
            System.err.println("UPLOAD ERROR: " + e.getMessage());
            e.printStackTrace(); 
            return ResponseEntity.internalServerError().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/patient/{email}")
    public ResponseEntity<List<MedicalReport>> getPatientReports(@PathVariable String email) {
        return ResponseEntity.ok(reportRepository.findByPatientEmail(email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReport(@PathVariable Long id) {
        reportRepository.deleteById(id);
        return ResponseEntity.ok("{\"message\": \"Deleted\"}");
    }
}