package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.MenuItem;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/*
This is a repository file for MenuItemReview
 */

 @Repository
 public interface MenuItemRepository extends CrudRepository<MenuItem, Long> {
   
 }