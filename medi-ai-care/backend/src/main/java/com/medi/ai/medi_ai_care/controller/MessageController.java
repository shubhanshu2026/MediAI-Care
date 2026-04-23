package com.medi.ai.medi_ai_care.controller;

import com.medi.ai.medi_ai_care.model.Doctor;
import com.medi.ai.medi_ai_care.model.Message;
import com.medi.ai.medi_ai_care.model.DoctorPatientRelation;
import com.medi.ai.medi_ai_care.model.User;
import com.medi.ai.medi_ai_care.repository.DoctorRepository;
import com.medi.ai.medi_ai_care.repository.MessageRepository;
import com.medi.ai.medi_ai_care.repository.DoctorPatientRelationRepository;
import com.medi.ai.medi_ai_care.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    @Autowired private MessageRepository messageRepository;
    @Autowired private DoctorPatientRelationRepository relationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private DoctorRepository doctorRepository; // FIX: needed to resolve doctor's user account

    // POST /api/messages/send
    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        Message saved = messageRepository.save(message);
        return ResponseEntity.ok(saved);
    }

    // GET /api/messages/{user1}/{user2}
    @GetMapping("/{user1}/{user2}")
    public ResponseEntity<List<Message>> getConversation(
            @PathVariable Long user1,
            @PathVariable Long user2) {
        return ResponseEntity.ok(messageRepository.findConversation(user1, user2));
    }

    // GET /api/messages/contacts/doctor/{doctorId}
    // doctorId here = doctors.id (from JWT doctorId field)
    // Returns patients (as users.id) who have approved appointments with this doctor
    @GetMapping("/contacts/doctor/{doctorId}")
    public ResponseEntity<List<Map<String, Object>>> getDoctorContacts(@PathVariable Long doctorId) {
        List<DoctorPatientRelation> relations = relationRepository.findByDoctorId(doctorId);

        List<Map<String, Object>> contacts = relations.stream()
            .map(rel -> {
                // patientId in relation = users.id (stored correctly in AppointmentController)
                User patient = userRepository.findById(rel.getPatientId()).orElse(null);
                return Map.<String, Object>of(
                    "id",   rel.getPatientId(),
                    "name", patient != null
                                ? (patient.getFullName() != null ? patient.getFullName() : patient.getEmail())
                                : "Patient #" + rel.getPatientId(),
                    "role", "PATIENT"
                );
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(contacts);
    }

    // GET /api/messages/contacts/patient/{patientId}
    // patientId here = users.id
    // FIX: relation.doctorId = doctors.id, but chat sends messages using users.id.
    //      We must resolve doctors.id → users.id by looking up the Doctor by id,
    //      then finding the User by that Doctor's email.
    @GetMapping("/contacts/patient/{patientId}")
    public ResponseEntity<List<Map<String, Object>>> getPatientContacts(@PathVariable Long patientId) {
        List<DoctorPatientRelation> relations = relationRepository.findByPatientId(patientId);

        List<Map<String, Object>> contacts = relations.stream()
            .map(rel -> {
                // FIX: rel.doctorId = doctors.id, not users.id.
                //      Resolve: doctors.id → Doctor.email → User (to get users.id for messaging)
                Long doctorUserId = rel.getDoctorId(); // fallback
                String doctorDisplayName = "Doctor #" + rel.getDoctorId();

                Doctor doctor = doctorRepository.findById(rel.getDoctorId()).orElse(null);
                if (doctor != null && doctor.getEmail() != null) {
                    User doctorUser = userRepository.findByEmail(doctor.getEmail()).orElse(null);
                    if (doctorUser != null) {
                        doctorUserId = doctorUser.getId(); // use users.id for messaging
                        doctorDisplayName = "Dr. " + (doctorUser.getFullName() != null
                            ? doctorUser.getFullName() : doctorUser.getEmail());
                    }
                }

                return Map.<String, Object>of(
                    "id",   doctorUserId,
                    "name", doctorDisplayName,
                    "role", "DOCTOR"
                );
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(contacts);
    }
}