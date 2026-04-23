package com.medi.ai.medi_ai_care.controller;

import com.medi.ai.medi_ai_care.model.Prescription;
import com.medi.ai.medi_ai_care.repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.medi.ai.medi_ai_care.service.PrescriptionService;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/medical")
@CrossOrigin(origins = "*")
public class MedicalActionController {

    @Autowired
    private PrescriptionService prescriptionService; // Inject Service instead of Repo

    @PostMapping("/prescription/issue")
    public ResponseEntity<Prescription> issuePrescription(@RequestBody Prescription prescription) {
        return ResponseEntity.ok(prescriptionService.savePrescription(prescription));
    }

    @GetMapping("/prescription/appointment/{appointmentId}")
    public ResponseEntity<Prescription> getPrescription(@PathVariable Long appointmentId) {
        Prescription p = prescriptionService.getByAppointmentId(appointmentId);
        return p != null ? ResponseEntity.ok(p) : ResponseEntity.notFound().build();
    }
}