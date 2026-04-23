package com.medi.ai.medi_ai_care.repository;

import com.medi.ai.medi_ai_care.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Fetch all messages exchanged between user1 and user2, ordered chronologically.
     */
    @Query("""
        SELECT m FROM Message m
        WHERE (m.senderId = :user1 AND m.receiverId = :user2)
           OR (m.senderId = :user2 AND m.receiverId = :user1)
        ORDER BY m.timestamp ASC
    """)
    List<Message> findConversation(@Param("user1") Long user1, @Param("user2") Long user2);
}
