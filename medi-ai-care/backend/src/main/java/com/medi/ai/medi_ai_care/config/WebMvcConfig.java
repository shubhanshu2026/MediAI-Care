package com.medi.ai.medi_ai_care.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * FIX FOR 403 on prescription file downloads.
 *
 * Spring Boot does NOT automatically serve files from arbitrary disk directories.
 * This configurer maps the URL path /uploads/** to the actual filesystem folder
 * ./uploads/ (relative to where the JAR is launched).
 *
 * SecurityConfig already permits /uploads/** at the HTTP security layer.
 * Together these two configs mean:
 *   1. Spring Security lets the request through (no 403).
 *   2. Spring MVC finds and streams the file from disk.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Resolve the absolute path to the uploads directory next to the JAR.
        String uploadPath = Paths.get("uploads").toAbsolutePath().toUri().toString();

        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations(uploadPath + "/");
    }
}
