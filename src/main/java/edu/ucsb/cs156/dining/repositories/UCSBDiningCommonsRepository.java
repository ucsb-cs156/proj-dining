package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.UCSBDiningCommons;

import org.springframework.beans.propertyeditors.StringArrayPropertyEditor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * The UCSBDiningCommonsRepository is a repository for UCSBDiningCommons entities
 */
@Repository
public interface UCSBDiningCommonsRepository extends CrudRepository<UCSBDiningCommons, String> {
 
}