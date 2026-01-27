package com.se04project.morimizu;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class SortApiController {
    private SortService sortService = new SortService();

    @PostMapping("/sort")
    public List<SortStep> sort(@RequestBody SortRequest request) {
        return sortService.executeSortWithSteps(request.getArray(), request.getAlgorithm(), request.getOrder());
    }
}
