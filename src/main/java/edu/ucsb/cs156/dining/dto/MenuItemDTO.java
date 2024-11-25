package edu.ucsb.cs156.dining.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for simplified MenuItem
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MenuItemDTO {
    private Long id;         // Database ID of the menu item
    private String name;     // Name of the menu item
    private String station;  // Station where the menu item is served
}
