package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.DiningCommons;

import org.springframework.beans.propertyeditors.StringArrayPropertyEditor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * The DiningCommonsRepository is a repository for DiningCommons entities
 */
@Repository
public interface DiningCommonsRepository extends CrudRepository<DiningCommons, String> {
 
}