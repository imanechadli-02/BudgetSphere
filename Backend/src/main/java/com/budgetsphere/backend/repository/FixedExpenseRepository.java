package com.budgetsphere.backend.repository;

import com.budgetsphere.backend.entity.FixedExpense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface FixedExpenseRepository extends JpaRepository<FixedExpense, Long> {
    Page<FixedExpense> findByUserId(Long userId, Pageable pageable);
    Page<FixedExpense> findByUserIdAndStartDateBetween(Long userId, LocalDate from, LocalDate to, Pageable pageable);
}
