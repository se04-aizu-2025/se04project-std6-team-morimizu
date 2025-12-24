package com.se04project.morimizu;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {
    @GetMapping("/demo")
    public String display() {
        return "index";
    }
}
