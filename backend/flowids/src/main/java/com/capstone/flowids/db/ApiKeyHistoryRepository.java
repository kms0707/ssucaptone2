package com.capstone.flowids.db;

import com.capstone.flowids.domain.ApiKeyHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApiKeyHistoryRepository extends JpaRepository<ApiKeyHistory, Long> {
}
