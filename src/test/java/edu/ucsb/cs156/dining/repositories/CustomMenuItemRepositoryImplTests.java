package edu.ucsb.cs156.dining.repositories;

import static org.junit.jupiter.api.Assertions.assertEquals;

import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.models.Entree;
import edu.ucsb.cs156.dining.services.wiremock.WiremockService;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import jakarta.persistence.EntityManager;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@DataJpaTest
public class CustomMenuItemRepositoryImplTests {

  @Autowired private MenuItemRepository menuItemRepository;

  @Autowired private ReviewRepository reviewRepository;

  @Autowired private UserRepository userRepository;

  @MockitoBean private WiremockService wmService;

  @Autowired EntityManager em;

  User user;

  @BeforeEach
  public void setup() {
    String googleSub = "fakeUser";
    String email = "user@example.org";
    String pictureUrl = "https://example.org/fake.jpg";
    String fullName = "Fake User";
    String givenName = "Fake";
    String familyName = "User";
    boolean emailVerified = true;
    String locale = "";
    String hostedDomain = "example.org";
    user =
        User.builder()
            .googleSub(googleSub)
            .email(email)
            .pictureUrl(pictureUrl)
            .fullName(fullName)
            .givenName(givenName)
            .familyName(familyName)
            .emailVerified(emailVerified)
            .locale(locale)
            .hostedDomain(hostedDomain)
            .build();
  }

  @Test
  public void behaves_correctly_on_no_matches() {
    userRepository.save(user);
    MenuItem a =
        MenuItem.builder()
            .diningCommonsCode("de-la-guerra")
            .mealCode("breakfast")
            .name("waffles")
            .station("self-serve")
            .reviews(List.of())
            .build();
    MenuItem b =
        MenuItem.builder()
            .diningCommonsCode("carrillo")
            .mealCode("lunch")
            .name("pizza")
            .station("station 1")
            .build();

    Review review1 =
        Review.builder()
            .item(a)
            .reviewer(user)
            .itemsStars(5L)
            .dateItemServed(LocalDateTime.of(2025, 1, 15, 12, 0))
            .reviewerComments("Absolutely loved the waffles, crispy and delicious!")
            .status(ModerationStatus.APPROVED)
            .build();

    Review review2 =
        Review.builder()
            .item(a)
            .reviewer(user)
            .itemsStars(3L)
            .dateItemServed(LocalDateTime.of(2025, 1, 16, 12, 0))
            .reviewerComments("Pretty average, nothing special.")
            .status(ModerationStatus.AWAITING_REVIEW)
            .build();

    Review review3 =
        Review.builder()
            .item(b)
            .reviewer(user)
            .itemsStars(1L)
            .dateItemServed(LocalDateTime.of(2025, 1, 17, 12, 0))
            .reviewerComments("Terrible pizza, would not recommend.")
            .status(ModerationStatus.REJECTED)
            .build();

    menuItemRepository.saveAll(List.of(a, b));
    reviewRepository.saveAll(List.of(review1, review2, review3));

    // Required so that Hibernate clears the object map and repopulates the collection
    em.flush();
    em.clear();

    Entree entree = Entree.builder().name("waffle").station("station 1").build();

    List<MenuItem> MenuItems =
        menuItemRepository.findExistingEntrees("carrillo", "lunch", List.of(entree));

    assertEquals(0, MenuItems.size());
  }

  @Test
  public void behaves_correctly_on_existing_entrees_and_nonexisting() {
    userRepository.save(user);
    MenuItem a =
        MenuItem.builder()
            .diningCommonsCode("de-la-guerra")
            .mealCode("breakfast")
            .name("waffles")
            .station("self-serve")
            .build();
    MenuItem b =
        MenuItem.builder()
            .diningCommonsCode("carrillo")
            .mealCode("lunch")
            .name("pizza")
            .station("station 1")
            .build();

    Review review1 =
        Review.builder()
            .item(a)
            .reviewer(user)
            .itemsStars(5L)
            .dateItemServed(LocalDateTime.of(2025, 1, 15, 12, 0))
            .reviewerComments("Absolutely loved the waffles, crispy and delicious!")
            .status(ModerationStatus.APPROVED)
            .build();

    Review review2 =
        Review.builder()
            .item(a)
            .reviewer(user)
            .itemsStars(3L)
            .dateItemServed(LocalDateTime.of(2025, 1, 16, 12, 0))
            .reviewerComments("Pretty average, nothing special.")
            .status(ModerationStatus.AWAITING_REVIEW)
            .build();

    Review review3 =
        Review.builder()
            .item(b)
            .reviewer(user)
            .itemsStars(1L)
            .dateItemServed(LocalDateTime.of(2025, 1, 17, 12, 0))
            .reviewerComments("Terrible pizza, would not recommend.")
            .status(ModerationStatus.REJECTED)
            .build();

    menuItemRepository.saveAll(List.of(a, b));
    reviewRepository.saveAll(List.of(review1, review2, review3));

    // Required so that Hibernate clears the object map and repopulates the collection
    em.flush();
    em.clear();

    List<MenuItem> dlgItems =
        menuItemRepository.findExistingEntrees(
            "de-la-guerra",
            "breakfast",
            List.of(
                Entree.builder().name("waffles").station("self-serve").build(),
                Entree.builder().name("fake").station("fake").build()));

    assertEquals(1, dlgItems.size());
    assertEquals(2, dlgItems.getFirst().getReviews().size());

    List<MenuItem> carrilloItems =
        menuItemRepository.findExistingEntrees(
            "carrillo",
            "lunch",
            List.of(Entree.builder().name("pizza").station("station 1").build()));

    assertEquals(1, carrilloItems.size());
    assertEquals(1, carrilloItems.getFirst().getReviews().size());
  }

  @Test
  public void behaves_on_no_reviews() {
    userRepository.save(user);
    MenuItem a =
        MenuItem.builder()
            .diningCommonsCode("de-la-guerra")
            .mealCode("breakfast")
            .name("waffles")
            .station("self-serve")
            .build();

    menuItemRepository.save(a);

    // Required so that Hibernate clears the object map and repopulates the collection
    em.flush();
    em.clear();

    List<MenuItem> MenuItems =
        menuItemRepository.findExistingEntrees(
            "de-la-guerra",
            "breakfast",
            List.of(Entree.builder().name("waffles").station("self-serve").build()));

    assertEquals(1, MenuItems.size());
    assertEquals(0, MenuItems.getFirst().getReviews().size());
  }
}
