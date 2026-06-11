package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.models.Entree;
import edu.ucsb.cs156.dining.models.MenuItemDto;
import java.util.List;

public interface CustomMenuItemRepository {

  List<MenuItemDto> projectExistingEntrees(
      String diningCommonCode, String mealCode, List<Entree> entrees);
}
