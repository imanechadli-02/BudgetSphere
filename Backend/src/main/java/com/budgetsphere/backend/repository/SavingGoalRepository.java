package com.budgetsphere.backend.repository;

import com.budgetsphere.backend.entity.SavingGoal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SavingGoalRepository extends JpaRepository<SavingGoal, Long> {
    Page<SavingGoal> findByUserId(Long userId, Pageable pageable);
}
