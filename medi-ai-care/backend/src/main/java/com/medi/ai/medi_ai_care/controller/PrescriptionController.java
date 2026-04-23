package com.medi.ai.medi_ai_care.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medi.ai.medi_ai_care.model.Prescription;
import com.medi.ai.medi_ai_care.model.User;
import com.medi.ai.medi_ai_care.repository.UserRepository;
import com.medi.ai.medi_ai_care.service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE  –  POST /api/prescriptions/create
    //
    // Body (JSON):
    //   {
    //     "doctorId":  5,
    //     "patientId": 12,
    //     "diagnosis": "Seasonal flu",
    //     "medicines": "[{\"name\":\"Paracetamol\",\"dosage\":\"500mg\",\"instructions\":\"twice daily\"}]"
    //   }
    //
    // Security: caller MUST be DOCTOR (JWT role check).
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/create")
    public ResponseEntity<?> createPrescription(@RequestBody Map<String, Object> body) {
        try {
            Long doctorId  = Long.parseLong(body.get("doctorId").toString());
            Long patientId = Long.parseLong(body.get("patientId").toString());

            // Resolve doctor name from users table
            String doctorName = userRepository.findById(doctorId)
                    .map(u -> u.getFullName() != null ? u.getFullName() : u.getUsername())
                    .orElse("Unknown Doctor");

            // Resolve patient email from users table
            String patientEmail = userRepository.findById(patientId)
                    .map(User::getEmail)
                    .orElse(null);

            // medicines comes in as a JSON string or a List – normalise to String
            String medicinesJson;
            Object medicinesRaw = body.get("medicines");
            if (medicinesRaw instanceof String) {
                medicinesJson = (String) medicinesRaw;
            } else {
                medicinesJson = objectMapper.writeValueAsString(medicinesRaw);
            }

            Long appointmentId = body.containsKey("appointmentId") && body.get("appointmentId") != null
                    ? Long.parseLong(body.get("appointmentId").toString()) : null;

            Prescription rx = Prescription.builder()
                    .doctorId(doctorId)
                    .doctorName(doctorName)
                    .patientId(patientId)
                    .patientEmail(patientEmail)
                    .appointmentId(appointmentId)
                    .diagnosis(body.getOrDefault("diagnosis", "").toString())
                    .medicines(medicinesJson)
                    .issuedDate(LocalDateTime.now())
                    .build();

            return ResponseEntity.ok(prescriptionService.savePrescription(rx));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPLOAD  –  POST /api/prescriptions/upload   (multipart, file + text)
    //
    // Form fields: doctorId, patientId, diagnosis  (all required)
    //              file  (optional – PDF / image)
    //              appointmentId (optional)
    //
    // Saves file to ./uploads/prescriptions/ and stores relative path in DB.
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/upload")
    public ResponseEntity<?> uploadPrescription(
            @RequestParam("doctorId")  Long doctorId,
            @RequestParam("patientId") Long patientId,
            @RequestParam(value = "diagnosis",     required = false) String diagnosis,
            @RequestParam(value = "appointmentId", required = false) Long appointmentId,
            @RequestParam(value = "file",          required = false) MultipartFile file) {
        try {
            String fileUrl = null;

            if (file != null && !file.isEmpty()) {
                // Store file in ./uploads/prescriptions/
                Path uploadDir = Paths.get("uploads/prescriptions");
                Files.createDirectories(uploadDir);

                String originalName = Objects.requireNonNullElse(file.getOriginalFilename(), "prescription");
                String fileName = System.currentTimeMillis() + "_" + originalName;
                Path filePath = uploadDir.resolve(fileName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                fileUrl = "/uploads/prescriptions/" + fileName;
            }

            String doctorName = userRepository.findById(doctorId)
                    .map(u -> u.getFullName() != null ? u.getFullName() : u.getUsername())
                    .orElse("Unknown Doctor");

            String patientEmail = userRepository.findById(patientId)
                    .map(User::getEmail)
                    .orElse(null);

            Prescription rx = Prescription.builder()
                    .doctorId(doctorId)
                    .doctorName(doctorName)
                    .patientId(patientId)
                    .patientEmail(patientEmail)
                    .appointmentId(appointmentId)
                    .diagnosis(diagnosis)
                    .medicines(fileUrl)          // store file URL in medicines field when file upload
                    .issuedDate(LocalDateTime.now())
                    .build();

            return ResponseEntity.ok(prescriptionService.savePrescription(rx));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATIENT VIEW  –  GET /api/prescriptions/patient/{patientId}
    //
    // Security: only the patient themselves should call this (validate via JWT).
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>> getPatientPrescriptions(@PathVariable Long patientId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatientId(patientId));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DOCTOR VIEW  –  GET /api/prescriptions/doctor/{doctorId}
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Prescription>> getDoctorPrescriptions(@PathVariable Long doctorId) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByDoctor(doctorId));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LEGACY  –  GET /api/prescriptions/patient/email/{email}
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/patient/email/{email}")
    public ResponseEntity<List<Prescription>> getPatientPrescriptionsByEmail(@PathVariable String email) {
        return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatientEmail(email));
    }
}
