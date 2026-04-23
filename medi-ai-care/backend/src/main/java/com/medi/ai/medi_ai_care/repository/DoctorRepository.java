package com.medi.ai.medi_ai_care.repository;

import com.medi.ai.medi_ai_care.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    // FIX: Look up doctor record by email so we can find the correct doctorId
    //      when a doctor user logs in (users.id ≠ doctors.id).
    Optional<Doctor> findByEmail(String email);
}