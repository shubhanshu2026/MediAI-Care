package com.medi.ai.medi_ai_care.service;

import com.medi.ai.medi_ai_care.dto.SignupRequest;
import com.medi.ai.medi_ai_care.model.Doctor;
import com.medi.ai.medi_ai_care.model.Role;
import com.medi.ai.medi_ai_care.model.User;
import com.medi.ai.medi_ai_care.repository.DoctorRepository;
import com.medi.ai.medi_ai_care.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    @Autowired private UserRepository userRepository;
    @Autowired private DoctorRepository doctorRepository;   // FIX: auto-create Doctor record on signup
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRole() != null ? user.getRole().name() : "PATIENT")
                .build();
    }

    public String registerUser(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return "Error: Username is already taken!";
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (Exception e) {
            role = Role.PATIENT;
        }
        user.setRole(role);
        userRepository.save(user);

        // FIX: When a DOCTOR registers, automatically create a matching Doctor record
        //      linked by email. This ensures doctors.email = users.email, so AuthController
        //      can look up doctors.id at login time and return it in the JWT response.
        //      Without this, getDoctorAppointments() always returned 0 results because
        //      it queried by users.id instead of doctors.id.
        if (Role.DOCTOR.equals(role)) {
            boolean doctorExists = doctorRepository.findByEmail(request.getEmail()).isPresent();
            if (!doctorExists) {
                Doctor doctor = Doctor.builder()
                    .name(request.getFullName())
                    .email(request.getEmail())
                    .specialization("")   // Doctor can update this via profile later
                    .hospital("")
                    .fee(0.0)
                    .build();
                doctorRepository.save(doctor);
            }
        }

        return "User registered successfully!";
    }
}