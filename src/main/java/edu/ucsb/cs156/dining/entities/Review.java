package edu.ucsb.cs156.dining.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "reviews")
@EntityListeners(AuditingEntityListener.class)
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private long studentId;

    @Column(nullable = false)
    private String itemId;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT NULL")
    private String reviewerComments;

    @Column(columnDefinition = "BIGINT DEFAULT NULL")
    @Min(1)
    @Max(5)
    private Long itemsStars;

    @Column(nullable = false)
    private LocalDateTime dateItemServed;

    @Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'Awaiting Moderation'")
    private String status;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT NULL")
    private String userIdModerator;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT NULL")
    private String moderatorComments;

        
    @CreatedDate
    @Column(nullable = false)
    private LocalDateTime dateCreated;

    @LastModifiedDate
    private LocalDateTime dateEdited;
}