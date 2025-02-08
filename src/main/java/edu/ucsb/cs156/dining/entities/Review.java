package edu.ucsb.cs156.dining.entities;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "reviews")
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id")
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

    @Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'Awaiting Moderation'")
    private ModerationStatus status = ModerationStatus.AWAITING_REVIEW;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT NULL")
    private String userIdModerator;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT NULL")
    private String moderatorComments;

    @Column(nullable = false)
    private LocalDateTime dateCreated;

    @Column(nullable = false)
    private LocalDateTime dateEdited;

    @ManyToOne
    @JoinColumn(name = "item_id", nullable = false)
    private MenuItem item;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User reviewer;
}