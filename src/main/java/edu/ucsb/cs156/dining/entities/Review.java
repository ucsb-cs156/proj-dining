package edu.ucsb.cs156.dining.entities;

import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;


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

    @Column(columnDefinition = "VARCHAR(255) DEFAULT NULL")
    private String reviewerComments;

    @Column(columnDefinition = "BIGINT DEFAULT NULL")
    @Min(1)
    @Max(5)
    private Long itemsStars;

    @Column(nullable = false)
    private LocalDateTime dateItemServed;

    @Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'AWAITING_REVIEW'")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ModerationStatus status = ModerationStatus.AWAITING_REVIEW;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT NULL")
    private String userIdModerator;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT NULL")
    private String moderatorComments;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime dateCreated;

    @LastModifiedDate
    private LocalDateTime dateEdited;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private MenuItem item;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User reviewer;
}