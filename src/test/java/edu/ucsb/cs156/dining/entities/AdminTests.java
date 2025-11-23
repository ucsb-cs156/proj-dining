package edu.ucsb.cs156.dining.entities;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import org.junit.jupiter.api.Test;

public class AdminTests {

  @Test
  public void testAdminBuilder() {
    // arrange & act
    Admin admin = Admin.builder().email("admin@ucsb.edu").build();

    // assert
    assertEquals("admin@ucsb.edu", admin.getEmail());
  }

  @Test
  public void testAdminAllArgsConstructor() {
    // arrange & act
    Admin admin = new Admin("admin@ucsb.edu");

    // assert
    assertEquals("admin@ucsb.edu", admin.getEmail());
  }

  @Test
  public void testAdminSetters() {
    // arrange
    Admin admin = Admin.builder().email("admin1@ucsb.edu").build();

    // act
    admin.setEmail("admin2@ucsb.edu");

    // assert
    assertEquals("admin2@ucsb.edu", admin.getEmail());
  }

  @Test
  public void testAdminEquality() {
    // arrange
    Admin admin1 = Admin.builder().email("admin@ucsb.edu").build();
    Admin admin2 = Admin.builder().email("admin@ucsb.edu").build();
    Admin admin3 = Admin.builder().email("different@ucsb.edu").build();

    // assert
    assertEquals(admin1, admin2);
    assertNotEquals(admin1, admin3);
  }

  @Test
  public void testAdminHashCode() {
    // arrange
    Admin admin1 = Admin.builder().email("admin@ucsb.edu").build();
    Admin admin2 = Admin.builder().email("admin@ucsb.edu").build();

    // assert
    assertEquals(admin1.hashCode(), admin2.hashCode());
  }

  @Test
  public void testAdminToString() {
    // arrange
    Admin admin = Admin.builder().email("admin@ucsb.edu").build();

    // act
    String result = admin.toString();

    // assert
    assertEquals("Admin(email=admin@ucsb.edu)", result);
  }
}
