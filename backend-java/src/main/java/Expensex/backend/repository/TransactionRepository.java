package Expensex.backend.repository;

import Expensex.backend.model.Transaction;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends MongoRepository<Transaction, String> {

    List<Transaction> findByUserIdOrderByIdDesc(ObjectId userId);

    Optional<Transaction> findByIdAndUserId(String id, ObjectId userId);
}
