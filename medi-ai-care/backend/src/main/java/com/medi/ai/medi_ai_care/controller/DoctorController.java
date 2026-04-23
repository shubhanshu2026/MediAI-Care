package com.medi.ai.medi_ai_care.controller;

import com.medi.ai.medi_ai_care.model.Doctor;
import com.medi.ai.medi_ai_care.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "*") // Crucial for React to connect
public class DoctorController {

    @Autowired
    private DoctorRepository doctorRepository;

    // This is the endpoint your React app calls to fill the 3-column grid
    @GetMapping("/list")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findAll();
        return ResponseEntity.ok(doctors);
    }
}