package Expensex.backend.controller;

import Expensex.backend.model.Transaction;
import Expensex.backend.repository.TransactionRepository;
import Expensex.backend.security.JwtService;
import org.bson.types.ObjectId;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final JwtService jwtService;

    public TransactionController(
            TransactionRepository transactionRepository,
            JwtService jwtService
    ) {
        this.transactionRepository = transactionRepository;
        this.jwtService = jwtService;
    }

    private ObjectId getUserId(String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authentication required");
        }

        String token = authHeader.substring(7);

        String userId = jwtService.extractUserId(token);

        return new ObjectId(userId);
    }

    @GetMapping
    public ResponseEntity<?> getTransactions(
            @RequestHeader(value = "Authorization", required = false)
            String authHeader
    ) {
        try {
            ObjectId userId = getUserId(authHeader);

            List<Transaction> transactions =
                    transactionRepository.findByUserIdOrderByIdDesc(userId);

            return ResponseEntity.ok(transactions);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(
                    Map.of("message", "Authentication failed")
            );
        }
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(
            @RequestHeader(value = "Authorization", required = false)
            String authHeader,
            @RequestBody Transaction transaction
    ) {
        try {
            ObjectId userId = getUserId(authHeader);

            transaction.setUserId(userId);

            Transaction saved =
                    transactionRepository.save(transaction);

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(
                    Map.of("message", "Authentication failed")
            );
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(
            @RequestHeader(value = "Authorization", required = false)
            String authHeader,
            @PathVariable String id,
            @RequestBody Transaction updated
    ) {
        try {
            ObjectId userId = getUserId(authHeader);

            Transaction existing =
                    transactionRepository
                            .findByIdAndUserId(id, userId)
                            .orElseThrow();

            existing.setTitle(updated.getTitle());
            existing.setAmount(updated.getAmount());
            existing.setCategory(updated.getCategory());
            existing.setDate(updated.getDate());
            existing.setType(updated.getType());
            existing.setCurrency(updated.getCurrency());

            return ResponseEntity.ok(
                    transactionRepository.save(existing)
            );

        } catch (Exception e) {
            return ResponseEntity.status(404).body(
                    Map.of("message", "Transaction not found")
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(
            @RequestHeader(value = "Authorization", required = false)
            String authHeader,
            @PathVariable String id
    ) {
        try {
            ObjectId userId = getUserId(authHeader);

            Transaction transaction =
                    transactionRepository
                            .findByIdAndUserId(id, userId)
                            .orElseThrow();

            transactionRepository.delete(transaction);

            return ResponseEntity.ok(
                    Map.of("message", "Transaction deleted successfully")
            );

        } catch (Exception e) {
            return ResponseEntity.status(404).body(
                    Map.of("message", "Transaction not found")
            );
        }
    }
}