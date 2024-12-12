package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.MenuItem;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * The UserRepository is a repository for User entities.
 */
@Repository
public interface MenuItemRepository extends CrudRepository<MenuItem, Long> {

    /**
     * This method returns a Menu Item.
     * 
     * @param diningCommonsCode code of dining commons
     * @param meal meal of food item
     * @param name name of food item
     * @param station station of food item
     * 
     * @return Optional of MenuItem
     */
    Optional<MenuItem> findFirstByDiningCommonsCodeAndMealAndNameAndStation(String diningCommonsCode, String meal, String name, String station);
 
}