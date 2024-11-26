package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.MenuItem;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for MenuItem
 */
@Repository
public interface MenuItemRepository extends CrudRepository<MenuItem, Long> {

    /**
     * Finds a MenuItem by its unique combination of diningCommonsCode, mealCode, name, and station.
     *
     * @param diningCommonsCode the code for the dining commons
     * @param mealCode          the meal code (e.g., "breakfast", "lunch", "dinner")
     * @param name              the name of the menu item
     * @param station           the station where the item is served
     * @return an Optional containing the MenuItem if found, or empty otherwise
     */
    @Query("SELECT m FROM menuitem m WHERE m.diningCommonsCode = :diningCommonsCode AND m.mealCode = :mealCode AND m.name = :name AND m.station = :station")
    Optional<MenuItem> findByUniqueFields(String diningCommonsCode, String mealCode, String name, String station);
}
