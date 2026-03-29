package com.budgetsphere.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "saving_goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private BigDecimal targetAmount;

    @Column(nullable = false)
    private LocalDate deadline;

    @Column(nullable = false)
    private BigDecimal monthlyContribution;

    @Column(nullable = false, columnDefinition = "DECIMAL(19,2) DEFAULT 0.00")
    @Builder.Default
    private BigDecimal contributedAmount = BigDecimal.ZERO;

    @Column(nullable = false, columnDefinition = "DECIMAL(19,2) DEFAULT 0.00")
    @Builder.Default
    private BigDecimal currentAmount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
