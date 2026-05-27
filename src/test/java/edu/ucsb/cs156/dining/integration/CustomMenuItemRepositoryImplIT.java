package edu.ucsb.cs156.dining.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import edu.ucsb.cs156.dining.entities.MenuItem;
import edu.ucsb.cs156.dining.entities.Review;
import edu.ucsb.cs156.dining.entities.User;
import edu.ucsb.cs156.dining.models.Entree;
import edu.ucsb.cs156.dining.models.MenuItemDto;
import edu.ucsb.cs156.dining.repositories.MenuItemRepository;
import edu.ucsb.cs156.dining.repositories.ReviewRepository;
import edu.ucsb.cs156.dining.repositories.UserRepository;
import edu.ucsb.cs156.dining.services.CurrentUserService;
import edu.ucsb.cs156.dining.statuses.ModerationStatus;
import edu.ucsb.cs156.dining.testconfig.TestConfig;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("integration")
@Import(TestConfig.class)
public class CustomMenuItemRepositoryImplIT {

  @Autowired private MenuItemRepository menuItemRepository;

  @Autowired private ReviewRepository reviewRepository;

  @Autowired private UserRepository userRepository;

  @Autowired private CurrentUserService cuService;

  @Test
  @WithMockUser
  public void behaves_correctly_on_no_matches() {
    User user = cuService.getUser();
    user.setId(0);
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
            .reviews(List.of())
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

    Entree entree = Entree.builder().name("waffle").station("station 1").build();

    List<MenuItemDto> menuItemDtos =
        menuItemRepository.projectExistingEntrees("carrillo", "lunch", List.of(entree));

    assertEquals(0, menuItemDtos.size());
  }

  @Test
  @WithMockUser
  public void behaves_correctly_on_existing_entrees_and_nonexisting() {
    User user = cuService.getUser();
    user.setId(0);
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
            .reviews(List.of())
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

    List<MenuItemDto> dlgItems =
        menuItemRepository.projectExistingEntrees(
            "de-la-guerra",
            "breakfast",
            List.of(
                Entree.builder().name("waffles").station("self-serve").build(),
                Entree.builder().name("fake").station("fake").build()));

    assertEquals(1, dlgItems.size());
    assertEquals(4.0, dlgItems.getFirst().reviewScore());

    List<MenuItemDto> carrilloItems =
        menuItemRepository.projectExistingEntrees(
            "carrillo",
            "lunch",
            List.of(Entree.builder().name("pizza").station("station 1").build()));

    assertEquals(1, carrilloItems.size());
    assertEquals(1.0, carrilloItems.getFirst().reviewScore());
  }

  @Test
  @WithMockUser
  public void behaves_on_no_reviews() {
    User user = cuService.getUser();
    user.setId(0);
    userRepository.save(user);
    MenuItem a =
        MenuItem.builder()
            .diningCommonsCode("de-la-guerra")
            .mealCode("breakfast")
            .name("waffles")
            .station("self-serve")
            .reviews(List.of())
            .build();

    menuItemRepository.save(a);

    List<MenuItemDto> menuItemDtos =
        menuItemRepository.projectExistingEntrees(
            "de-la-guerra",
            "breakfast",
            List.of(Entree.builder().name("waffles").station("self-serve").build()));

    assertEquals(1, menuItemDtos.size());
    assertNull(menuItemDtos.getFirst().reviewScore());
  }
}
