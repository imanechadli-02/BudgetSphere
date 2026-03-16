package com.budgetsphere.backend.repository;

import com.budgetsphere.backend.entity.Transaction;
import com.budgetsphere.backend.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByUserId(Long userId, Pageable pageable);
    Page<Transaction> findByUserIdAndType(Long userId, TransactionType type, Pageable pageable);
    Page<Transaction> findByUserIdAndDateBetween(Long userId, LocalDate from, LocalDate to, Pageable pageable);
    Page<Transaction> findByUserIdAndTypeAndDateBetween(Long userId, TransactionType type, LocalDate from, LocalDate to, Pageable pageable);
}
