package Expensex.backend.controller;

import Expensex.backend.model.User;
import Expensex.backend.repository.UserRepository;
import Expensex.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(
            AuthService authService,
            UserRepository userRepository
    ) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {

        try {

            String name = request.get("name");
            String email = request.get("email");
            String password = request.get("password");

            if (name == null || email == null || password == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "All fields are required")
                );
            }

            User user = authService.register(
                    name,
                    email,
                    password
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Registration successful",
                            "user", Map.of(
                                    "id", user.getId(),
                                    "name", user.getName(),
                                    "email", user.getEmail()
                            )
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {

        try {

            String email = request.get("email");
            String password = request.get("password");

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Email and password are required")
                );
            }

            String token = authService.login(
                    email,
                    password
            );

            User user = userRepository
                    .findByEmail(email.toLowerCase().trim())
                    .orElseThrow();

            Map<String, Object> response = new HashMap<>();

            response.put("token", token);

            response.put(
                    "user",
                    Map.of(
                            "id", user.getId(),
                            "name", user.getName(),
                            "email", user.getEmail()
                    )
            );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            return ResponseEntity.status(401).body(
                    Map.of("message", e.getMessage())
            );
        }
    }
}