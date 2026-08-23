package edu.ucsb.cs156.dining.repositories;

import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.models.Entree;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
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
  public List<MenuItem> findExistingEntrees(
      String diningCommonCode, String mealCode, List<Entree> entrees) {
    CriteriaBuilder cb = manager.getCriteriaBuilder();
    CriteriaQuery<MenuItem> cq = cb.createQuery(MenuItem.class);
    Root<MenuItem> mi = cq.from(MenuItem.class);
    mi.fetch("reviews", JoinType.LEFT);
    cq.select(mi)
        .distinct(true)
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
                        .toArray(Predicate[]::new))));

    return manager.createQuery(cq).getResultList();
  }
}
