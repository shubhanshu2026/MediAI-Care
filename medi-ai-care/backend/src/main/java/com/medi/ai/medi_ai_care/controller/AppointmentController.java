package com.medi.ai.medi_ai_care.controller;

import com.medi.ai.medi_ai_care.dto.AppointmentRequest;
import com.medi.ai.medi_ai_care.model.Appointment;
import com.medi.ai.medi_ai_care.model.DoctorPatientRelation;
import com.medi.ai.medi_ai_care.repository.AppointmentRepository;
import com.medi.ai.medi_ai_care.repository.DoctorPatientRelationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorPatientRelationRepository relationRepository;

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/appointments/book  –  Patient books appointment
    //
    // FIX: Now stores patientId (numeric) alongside patientEmail so the chat
    //      system can build contacts using real user IDs instead of 0.
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody AppointmentRequest req) {
        try {
            Appointment appointment = Appointment.builder()
                    .doctorId(req.getDoctorId())
                    .doctorName(req.getDoctorName())
                    .doctorSpecialization(req.getDoctorSpecialization())
                    .patientId(req.getPatientId())             // ← FIX: store numeric patient ID
                    .patientName(req.getPatientName())
                    .patientEmail(req.getPatientEmail())
                    .patientPhone(req.getPatientPhone())
                    .appointmentDate(LocalDate.parse(req.getAppointmentDate()))
                    .timeSlot(req.getTimeSlot())
                    .amount(req.getAmount())
                    .paymentMethod(req.getPaymentMethod())
                    .paymentStatus("DUE_AT_COUNTER")
                    .status("PENDING")                         // Starts as PENDING
                    .build();

            return ResponseEntity.ok(appointmentRepository.save(appointment));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/appointments/patient?email=  –  Patient views their appointments
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/patient")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@RequestParam String email) {
        return ResponseEntity.ok(appointmentRepository.findByPatientEmail(email));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/appointments/doctor/{doctorId}  –  Doctor views their schedule
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentRepository.findByDoctorId(doctorId));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/appointments/{id}/status  –  Doctor approves or rejects
    //
    // Body: { "status": "APPROVED" }  or  { "status": "REJECTED" }
    //
    // FIX: When doctor APPROVES, automatically create/update the doctor-patient
    //      relation so prescriptions and chat can link them.
    // ─────────────────────────────────────────────────────────────────────────
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "status field is required"));
        }

        return appointmentRepository.findById(id)
                .map(appt -> {
                    appt.setStatus(newStatus.toUpperCase());
                    Appointment saved = appointmentRepository.save(appt);

                    // FIX: When approved, store doctor-patient relation
                    if ("APPROVED".equalsIgnoreCase(newStatus)
                            && appt.getDoctorId() != null
                            && appt.getPatientId() != null) {

                        boolean exists = relationRepository
                                .existsByDoctorIdAndPatientId(appt.getDoctorId(), appt.getPatientId());

                        if (!exists) {
                            relationRepository.save(
                                DoctorPatientRelation.builder()
                                    .doctorId(appt.getDoctorId())
                                    .patientId(appt.getPatientId())
                                    .build()
                            );
                        }
                    }

                    return ResponseEntity.ok((Object) saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/appointments/{id}  –  Fetch single appointment
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointment(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
