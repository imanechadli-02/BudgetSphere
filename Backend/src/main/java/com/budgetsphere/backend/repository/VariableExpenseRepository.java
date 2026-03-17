package com.budgetsphere.backend.repository;

import com.budgetsphere.backend.entity.VariableExpense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface VariableExpenseRepository extends JpaRepository<VariableExpense, Long> {
    Page<VariableExpense> findByUserId(Long userId, Pageable pageable);
    Page<VariableExpense> findByUserIdAndExpenseDateBetween(Long userId, LocalDate from, LocalDate to, Pageable pageable);
}
