package edu.ucsb.cs156.dining.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private long studentId;

    @Column(nullable = false)
    private String itemId;

    @Column(nullable = false)
    private LocalDateTime dateItemServed;

    @Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'Awaiting Moderation'")
    private String status = "Awaiting Moderation";

    @Column(columnDefinition = "VARCHAR(255) DEFAULT NULL")
    private String userIdModerator;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT NULL")
    private String moderatorComments; 

    @Column(nullable = false)
    private LocalDateTime dateCreated;

    @Column(nullable = false)
    private LocalDateTime dateEdited;
}