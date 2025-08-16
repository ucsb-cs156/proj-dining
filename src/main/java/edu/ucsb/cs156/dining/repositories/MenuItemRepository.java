package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.MenuItem;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuItemRepository extends CrudRepository<MenuItem, Long> {
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
}
