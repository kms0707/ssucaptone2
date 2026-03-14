package com.capstone.flowids.db;

import com.capstone.flowids.domain.ApiKeyHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApiKeyHistoryRepository extends JpaRepository<ApiKeyHistory, Long> {
    @Modifying
    @Query("delete from ApiKeyHistory a where a.project.id = :projectId")
    void deleteAllByProjectId(@Param("projectId") Long projectId);
}
