package com.medi.ai.medi_ai_care.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** sender's user ID */
    private Long senderId;

    /** receiver's user ID */
    private Long receiverId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        this.timestamp = LocalDateTime.now();
    }
}
