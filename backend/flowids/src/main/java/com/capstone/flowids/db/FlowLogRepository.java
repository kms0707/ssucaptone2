package com.capstone.flowids.db;

import com.capstone.flowids.domain.FlowLogDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface FlowLogRepository extends ElasticsearchRepository<FlowLogDocument, String> {

    Page<FlowLogDocument> findByProjectId(String projectId, Pageable pageable);

    Page<FlowLogDocument> findByProjectIdAndIsAnomaly(String projectId, Boolean isAnomaly, Pageable pageable);
}
