package com.budgetsphere.backend.repository;

import com.budgetsphere.backend.entity.Need;
import com.budgetsphere.backend.entity.NeedPriority;
import com.budgetsphere.backend.entity.NeedStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NeedRepository extends JpaRepository<Need, Long> {
    Page<Need> findByUserId(Long userId, Pageable pageable);
    Page<Need> findByUserIdAndStatus(Long userId, NeedStatus status, Pageable pageable);
    Page<Need> findByUserIdAndPriority(Long userId, NeedPriority priority, Pageable pageable);
}
