package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.MenuItem;
import java.util.Optional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuItemRepository
    extends CrudRepository<MenuItem, Long>, CustomMenuItemRepository {
  /**
   * This method returns a MenuItem entity with a given id.
   *
   * @param diningCommonsCode of menu item
   * @param mealCode of menu item
   * @param name of menu item
   * @param station of menu item
   * @return Optional of Menu item based on the parameters (empty if not found)
   */
  Optional<MenuItem> findByDiningCommonsCodeAndMealCodeAndNameAndStation(
      String diningCommonsCode, String mealCode, String name, String station);

  boolean existsById(Long id);

  /**
   * Atomically inserts a menu item only if it does not already exist (based on the unique
   * constraint on diningCommonsCode, mealCode, name, station). This prevents race conditions when
   * multiple concurrent requests attempt to insert the same item simultaneously.
   *
   * @param diningCommonsCode dining commons code
   * @param mealCode meal code
   * @param name item name
   * @param station station name
   */
  @Modifying
  @Query(
      value =
          "INSERT INTO menuitem (dining_commons_code, meal_code, name, station)"
              + " VALUES (:diningCommonsCode, :mealCode, :name, :station)"
              + " ON CONFLICT (dining_commons_code, meal_code, name, station) DO NOTHING",
      nativeQuery = true)
  void insertIfNotExists(
      @Param("diningCommonsCode") String diningCommonsCode,
      @Param("mealCode") String mealCode,
      @Param("name") String name,
      @Param("station") String station);
}
