package com.medi.ai.medi_ai_care.controller;

import com.medi.ai.medi_ai_care.dto.JwtResponse;
import com.medi.ai.medi_ai_care.dto.LoginRequest;
import com.medi.ai.medi_ai_care.dto.Otpverifyrequest;
import com.medi.ai.medi_ai_care.dto.SignupRequest;
import com.medi.ai.medi_ai_care.model.Doctor;
import com.medi.ai.medi_ai_care.model.User;
import com.medi.ai.medi_ai_care.repository.DoctorRepository;
import com.medi.ai.medi_ai_care.repository.UserRepository;
import com.medi.ai.medi_ai_care.security.JwtUtils;
import com.medi.ai.medi_ai_care.security.MyUserDetailsService;
import com.medi.ai.medi_ai_care.service.OtpService;
import com.medi.ai.medi_ai_care.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
    "http://localhost:8081",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8081"
})
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtUtils jwtUtils;
    @Autowired private UserService userService;
    @Autowired private UserRepository userRepository;
    @Autowired private DoctorRepository doctorRepository;   // FIX: injected to resolve doctorId
    @Autowired private OtpService otpService;
    @Autowired private MyUserDetailsService userDetailsService;

    // ── SIGNUP ────────────────────────────────────────────────────────────
    @PostMapping("/signup")
    public ResponseEntity<String> registerUser(@RequestBody SignupRequest signupRequest) {
        String result = userService.registerUser(signupRequest);
        return ResponseEntity.ok(result);
    }

    // ── STEP 1: Validate credentials → send OTP ───────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> initiateLogin(@RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );
            otpService.generateAndSendOtp(loginRequest.getEmail());
            return ResponseEntity.ok(
                java.util.Map.of("message", "OTP sent to " + loginRequest.getEmail())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    // ── STEP 2: Verify OTP → issue JWT ────────────────────────────────────
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Otpverifyrequest request) {
        if (!otpService.verifyOtp(request.getEmail(), request.getOtp())) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Invalid or expired OTP. Please try again.");
        }

        try {
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authToken);

            String jwt = jwtUtils.generateToken(userDetails);

            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            String roleName = (user.getRole() != null) ? user.getRole().name() : "PATIENT";

            // FIX: Resolve the doctors.id for doctor accounts.
            //
            //      The bug: appointments store doctorId = doctors.id (from the doctors table).
            //      But the JWT previously only returned users.id. The doctor dashboard called
            //      getDoctorAppointments(user.id) using users.id, which never matched any
            //      appointment's doctorId → always returned 0 results.
            //
            //      Fix: if the user is a DOCTOR, look up their record in the doctors table
            //      by email and include doctors.id as doctorId in the JWT response.
            //      The frontend will store this and use it for appointment queries.
            Long doctorId = null;
            if ("DOCTOR".equalsIgnoreCase(roleName)) {
                doctorId = doctorRepository.findByEmail(request.getEmail())
                    .map(Doctor::getId)
                    .orElse(null);
            }

            return ResponseEntity.ok(JwtResponse.builder()
                .token(jwt)
                .id(user.getId())
                .doctorId(doctorId)       // null for patients, doctors.id for doctors
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(roleName)
                .build());

        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error issuing token: " + e.getMessage());
        }
    }
}