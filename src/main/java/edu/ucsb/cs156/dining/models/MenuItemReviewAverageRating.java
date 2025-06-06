package edu.ucsb.cs156.dining.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MenuItemReviewAverageRating {
    private Long id;
    private String name;
    private String station;
    private String diningCommonsCode;
    private Double averageRating;
}