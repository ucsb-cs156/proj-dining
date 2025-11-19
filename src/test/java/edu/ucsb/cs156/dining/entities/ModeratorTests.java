package edu.ucsb.cs156.dining.entities;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import org.junit.jupiter.api.Test;

public class ModeratorTests {

  @Test
  public void testModeratorBuilder() {
    // arrange & act
    Moderator moderator = Moderator.builder().email("moderator@ucsb.edu").build();

    // assert
    assertEquals("moderator@ucsb.edu", moderator.getEmail());
  }

  @Test
  public void testModeratorAllArgsConstructor() {
    // arrange & act
    Moderator moderator = new Moderator("moderator@ucsb.edu");

    // assert
    assertEquals("moderator@ucsb.edu", moderator.getEmail());
  }

  @Test
  public void testModeratorSetters() {
    // arrange
    Moderator moderator = Moderator.builder().email("moderator1@ucsb.edu").build();

    // act
    moderator.setEmail("moderator2@ucsb.edu");

    // assert
    assertEquals("moderator2@ucsb.edu", moderator.getEmail());
  }

  @Test
  public void testModeratorEquality() {
    // arrange
    Moderator moderator1 = Moderator.builder().email("moderator@ucsb.edu").build();
    Moderator moderator2 = Moderator.builder().email("moderator@ucsb.edu").build();
    Moderator moderator3 = Moderator.builder().email("different@ucsb.edu").build();

    // assert
    assertEquals(moderator1, moderator2);
    assertNotEquals(moderator1, moderator3);
  }

  @Test
  public void testModeratorHashCode() {
    // arrange
    Moderator moderator1 = Moderator.builder().email("moderator@ucsb.edu").build();
    Moderator moderator2 = Moderator.builder().email("moderator@ucsb.edu").build();

    // assert
    assertEquals(moderator1.hashCode(), moderator2.hashCode());
  }

  @Test
  public void testModeratorToString() {
    // arrange
    Moderator moderator = Moderator.builder().email("moderator@ucsb.edu").build();

    // act
    String result = moderator.toString();

    // assert
    assertEquals("Moderator(email=moderator@ucsb.edu)", result);
  }
}
