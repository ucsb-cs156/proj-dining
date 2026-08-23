package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.models.Entree;
import java.util.List;

public interface CustomMenuItemRepository {

  List<MenuItem> findExistingEntrees(
      String diningCommonCode, String mealCode, List<Entree> entrees);
}
