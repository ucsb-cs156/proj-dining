package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.models.CurrentUser;
import edu.ucsb.cs156.dining.services.CurrentUserService;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

/** This is an abstract class that provides common functionality for all API controllers. */
@Slf4j
public abstract class ApiController {
  @Autowired private CurrentUserService currentUserService;

  /**
   * This method returns the current user.
   *
   * @return the current user
   */
  protected CurrentUser getCurrentUser() {
    return currentUserService.getCurrentUser();
  }

  /**
   * This method returns a generic message.
   *
   * @param message the message
   * @return a map with the message
   */
  protected Object genericMessage(String message) {
    return Map.of("message", message);
  }

  /**
   * This method handles the EntityNotFoundException.
   *
   * @param e the exception
   * @return a map with the type and message of the exception
   */
  @ExceptionHandler({EntityNotFoundException.class})
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public Object handleGenericException(Throwable e) {
    return Map.of(
        "type", e.getClass().getSimpleName(),
        "message", e.getMessage());
  }

  /**
   * This method handles the UnsupportedOperationException for forbidden operations.
   *
   * @param e the exception
   * @return a map with the message of the exception
   */
  @ExceptionHandler({UnsupportedOperationException.class})
  @ResponseStatus(HttpStatus.FORBIDDEN)
  public Object handleUnsupportedOperationException(Throwable e) {
    return Map.of("message", e.getMessage());
  }
}
