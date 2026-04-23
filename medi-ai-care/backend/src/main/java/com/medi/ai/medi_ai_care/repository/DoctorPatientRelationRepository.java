package com.medi.ai.medi_ai_care.repository;

import com.medi.ai.medi_ai_care.model.DoctorPatientRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorPatientRelationRepository extends JpaRepository<DoctorPatientRelation, Long> {

    List<DoctorPatientRelation> findByDoctorId(Long doctorId);
    List<DoctorPatientRelation> findByPatientId(Long patientId);
    boolean existsByDoctorIdAndPatientId(Long doctorId, Long patientId);
}
