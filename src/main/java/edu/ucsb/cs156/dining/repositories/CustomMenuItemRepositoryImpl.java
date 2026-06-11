package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.models.Entree;
import edu.ucsb.cs156.dining.models.MenuItemDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.List;

/*
 * Custom repository implementation for MenuItem entity
 * We don't want to start h2 for unit testing; Should be thoroughly tested in integration tests
 */
public class CustomMenuItemRepositoryImpl implements CustomMenuItemRepository {

  private final EntityManager manager;

  public CustomMenuItemRepositoryImpl(EntityManager manager) {
    this.manager = manager;
  }

  @Override
  public List<MenuItemDto> projectExistingEntrees(
      String diningCommonCode, String mealCode, List<Entree> entrees) {
    CriteriaBuilder cb = manager.getCriteriaBuilder();
    CriteriaQuery<MenuItemDto> cq = cb.createQuery(MenuItemDto.class);
    Root<MenuItem> mi = cq.from(MenuItem.class);
    Join<MenuItem, Review> revJoin = mi.join("reviews", JoinType.LEFT);

    cq.multiselect(
            mi.get("id"),
            mi.get("diningCommonsCode"),
            mi.get("mealCode"),
            mi.get("name"),
            mi.get("station"),
            cb.avg(revJoin.get("itemsStars")))
        .where(
            cb.and(
                cb.equal(mi.get("diningCommonsCode"), diningCommonCode),
                cb.equal(mi.get("mealCode"), mealCode),
                cb.or(
                    entrees.stream()
                        .map(
                            entree ->
                                cb.and(
                                    cb.equal(mi.get("name"), entree.getName()),
                                    cb.equal(mi.get("station"), entree.getStation())))
                        .toArray(Predicate[]::new))))
        .groupBy(mi);

    return manager.createQuery(cq).getResultList();
  }
}
