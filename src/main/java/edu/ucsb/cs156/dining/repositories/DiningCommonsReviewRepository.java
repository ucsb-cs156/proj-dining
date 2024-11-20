package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.DiningCommonsReview;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;


 @Repository
 public interface DiningCommonsReviewRepository extends CrudRepository<DiningCommonsReview, Long> {
   
 }