package com.capstone.flowids.service;

import com.capstone.flowids.db.ApiKeyHistoryRepository;
import com.capstone.flowids.db.MemberRepository;
import com.capstone.flowids.db.ProjectRepository;
import com.capstone.flowids.domain.ApiKeyHistory;
import com.capstone.flowids.domain.Member;
import com.capstone.flowids.domain.Project;
import com.capstone.flowids.dto.ProjectCreateRequest;
import com.capstone.flowids.dto.ProjectResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final MemberRepository memberRepository;
    private final ProjectRepository projectRepository;
    private final ApiKeyHistoryRepository apiKeyHistoryRepository;
    private final RedisTemplate<String, String> redisTemplate;

    @Transactional
    public ProjectResponse createProject(Long memberId, ProjectCreateRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다"));

        String apiKey = generateApiKey();

        Project project = Project.builder()
                .member(member)
                .name(request.getName())
                .description(request.getDescription())
                .apiKey(apiKey)
                .apiKeyStatus("ACTIVE")
                .apiKeyCreatedAt(LocalDateTime.now())
                .build();

        projectRepository.save(project);
        return new ProjectResponse(project);
    }

    public List<ProjectResponse> getMyProjects(Long memberId) {
        return projectRepository.findAllByMember_Id(memberId).stream()
                .map(ProjectResponse::new)
                .toList();
    }

    @Transactional
    public ProjectResponse reissueApiKey(Long projectId, Long memberId, String reason) {
        Project project = projectRepository.findByIdAndMember_Id(projectId, memberId)
                .orElseThrow(() -> new EntityNotFoundException("프로젝트를 찾을 수 없습니다"));

        String oldApiKey = project.getApiKey();

        apiKeyHistoryRepository.save(new ApiKeyHistory(project, oldApiKey, LocalDateTime.now(), reason));

        redisTemplate.delete("APIKey:" + oldApiKey);

        project.updateApiKey(generateApiKey());

        return new ProjectResponse(project);
    }

    private String generateApiKey() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}
