package com.medi.ai.medi_ai_care.config;

import com.medi.ai.medi_ai_care.security.JwtRequestFilter;
import com.medi.ai.medi_ai_care.security.MyUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    @Lazy
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    private MyUserDetailsService myUserDetailsService;

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(myUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            .authorizeHttpRequests(auth -> auth
                // ── Preflight ──────────────────────────────────────────────
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ── Public auth endpoints ──────────────────────────────────
                .requestMatchers("/api/auth/**").permitAll()

                // ── AI / Voice (public) ────────────────────────────────────
                .requestMatchers("/api/ai/**").permitAll()
                .requestMatchers("/api/voice-predict").permitAll()

                // ── Doctor listing (public search) ─────────────────────────
                .requestMatchers(HttpMethod.GET, "/api/doctors/**").permitAll()

                // ── Static uploaded files ──────────────────────────────────
                .requestMatchers("/uploads/**").permitAll()

                // ── Appointments ───────────────────────────────────────────
                // FIX: Both patient and doctor appointment endpoints require authentication.
                //      The patient side was previously failing with 403 because PatientDashboard.tsx
                //      was using raw axios without attaching the Bearer token.
                //      The fix is in PatientDashboard.tsx (using apiClient), not here —
                //      but we explicitly list all appointment sub-paths to be unambiguous.
                .requestMatchers(HttpMethod.POST, "/api/appointments/book").authenticated()
                .requestMatchers(HttpMethod.GET,  "/api/appointments/patient").authenticated()
                .requestMatchers(HttpMethod.GET,  "/api/appointments/doctor/**").authenticated()
                .requestMatchers(HttpMethod.PUT,  "/api/appointments/**").authenticated()
                .requestMatchers(HttpMethod.GET,  "/api/appointments/**").authenticated()

                // ── Slots ──────────────────────────────────────────────────
                .requestMatchers("/api/slots/**").authenticated()

                // ── Messages ───────────────────────────────────────────────
                .requestMatchers("/api/messages/**").authenticated()

                // ── Prescriptions / Reports ────────────────────────────────
                .requestMatchers("/api/prescriptions/**").authenticated()
                .requestMatchers("/api/reports/**").authenticated()

                // ── Everything else requires a valid JWT ───────────────────
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8081",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:8081"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}