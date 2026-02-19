package com.capstone.flowids.db;

import com.capstone.flowids.domain.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByApiKeyAndApiKeyStatus(String apiKey, String apiKeyStatus);
    List<Project> findAllByMember_Id(Long memberId);
    Optional<Project> findByIdAndMember_Id(Long id, Long memberId);
}
