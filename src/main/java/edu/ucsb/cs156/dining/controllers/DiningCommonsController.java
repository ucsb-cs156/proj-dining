package edu.ucsb.cs156.dining.controllers;

import edu.ucsb.cs156.dining.entities.DiningCommons;
import edu.ucsb.cs156.dining.errors.EntityNotFoundException;
import edu.ucsb.cs156.dining.repositories.DiningCommonsRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/**
 * This is a REST controller for DiningCommons
 */

@Tag(name = "DiningCommons")
@RequestMapping("/api/diningcommons")
@RestController
@Slf4j
public class DiningCommonsController extends ApiController {

    @Autowired
    DiningCommonsRepository diningCommonsRepository;

    /**
     * THis method returns a list of all diningcommons.
     * @return a list of all diningcommons
     */
    @Operation(summary= "List all dining commons")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all")
    public Iterable<DiningCommons> allCommonss() {
        Iterable<DiningCommons> commons = diningCommonsRepository.findAll();
        return commons;
    }

    /**
     * This method returns a single diningcommons.
     * @param code code of the diningcommons
     * @return a single diningcommons
     */
    @Operation(summary= "Get a single common")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")
    public DiningCommons getById(
            @Parameter(name="code") @RequestParam String code) {
        DiningCommons commons = diningCommonsRepository.findById(code)
                .orElseThrow(() -> new EntityNotFoundException(DiningCommons.class, code));

        return commons;
    }

    /**
     * This method creates a new diningcommons. Accessible only to users with the role "ROLE_ADMIN".
     * @param code code of the diningcommons
     * @param name name of the diningcommons
     * @param hasSackMeal whether or not the commons has sack meals
     * @param hasTakeOutMeal whether or not the commons has take out meals
     * @param hasDiningCam whether or not the commons has a dining cam
     * @param latitude latitude of the commons
     * @param longitude logitude of the commons
     * @return the save diningcommons
     */
    @Operation(summary= "Create a new common")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/post")
    public DiningCommons postCommons(
        @Parameter(name="code") @RequestParam String code,
        @Parameter(name="name") @RequestParam String name,
        @Parameter(name="hasSackMeal") @RequestParam boolean hasSackMeal,
        @Parameter(name="hasTakeOutMeal") @RequestParam boolean hasTakeOutMeal,
        @Parameter(name="hasDiningCam") @RequestParam boolean hasDiningCam,
        @Parameter(name="latitude") @RequestParam double latitude,
        @Parameter(name="longitude") @RequestParam double longitude
        )
        {

        DiningCommons commons = new DiningCommons();
        commons.setCode(code);
        commons.setName(name);
        commons.setHasSackMeal(hasSackMeal);
        commons.setHasTakeOutMeal(hasTakeOutMeal);
        commons.setHasDiningCam(hasDiningCam);
        commons.setLatitude(latitude);
        commons.setLongitude(longitude);

        DiningCommons savedCommons = diningCommonsRepository.save(commons);

        return savedCommons;
    }

    /**
     * Delete a diningcommons. Accessible only to users with the role "ROLE_ADMIN".
     * @param code code of the commons
     * @return a message indiciating the commons was deleted
     */
    @Operation(summary= "Delete a DiningCommons")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Object deleteCommons(
            @Parameter(name="code") @RequestParam String code) {
        DiningCommons commons = diningCommonsRepository.findById(code)
                .orElseThrow(() -> new EntityNotFoundException(DiningCommons.class, code));

        diningCommonsRepository.delete(commons);
        return genericMessage("DiningCommons with id %s deleted".formatted(code));
    }

    /**
     * Update a single diningcommons. Accessible only to users with the role "ROLE_ADMIN".
     * @param code code of the diningcommons
     * @param incoming the new commons contents
     * @return the updated commons object
     */
    @Operation(summary= "Update a single common")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("")
    public DiningCommons updateCommons(
            @Parameter(name="code") @RequestParam String code,
            @RequestBody @Valid DiningCommons incoming) {

        DiningCommons commons = diningCommonsRepository.findById(code)
                .orElseThrow(() -> new EntityNotFoundException(DiningCommons.class, code));


        commons.setName(incoming.getName());  
        commons.setHasSackMeal(incoming.getHasSackMeal());
        commons.setHasTakeOutMeal(incoming.getHasTakeOutMeal());
        commons.setHasDiningCam(incoming.getHasDiningCam());
        commons.setLatitude(incoming.getLatitude());
        commons.setLongitude(incoming.getLongitude());

        diningCommonsRepository.save(commons);

        return commons;
    }
}
