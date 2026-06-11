package edu.ucsb.cs156.dining.models;

/** DTO for {@link edu.ucsb.cs156.dining.entities.MenuItem} */
public record MenuItemDto(
    Long id,
    String diningCommonsCode,
    String mealCode,
    String name,
    String station,
    Double reviewScore) {}
