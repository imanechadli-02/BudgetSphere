package com.budgetsphere.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "needs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Need {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private BigDecimal estimatedPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NeedStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NeedPriority priority;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
