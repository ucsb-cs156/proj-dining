package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.UCSBDate;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * The UCSBDateRepository is a repository for UCSBDate entities.
 */

@Repository
public interface UCSBDateRepository extends CrudRepository<UCSBDate, Long> {
  /**
   * This method returns all UCSBDate entities with a given quarterYYYYQ.
   * @param quarterYYYYQ quarter in the format YYYYQ (e.g. 20241 for Winter 2024, 20242 for Spring 2024, 20243 for Summer 2024, 20244 for Fall 2024)
   * @return all UCSBDate entities with a given quarterYYYYQ
   */
  Iterable<UCSBDate> findAllByQuarterYYYYQ(String quarterYYYYQ);
}