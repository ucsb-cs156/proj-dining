package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.DiningMenuAPI;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiningMenuAPIRepository extends CrudRepository<DiningMenuAPI, String> {
  public Optional<DiningMenuAPI> findByName(String name);

  public List<DiningMenuAPI> findAll();
}