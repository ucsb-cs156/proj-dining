package edu.ucsb.cs156.dining.models;

import lombok.Data;

/**
 * Represents a Meal returned by the UCSB Dining Menu API.
 */
@Data
public class Meal {
    private String name;
    private String code;
}