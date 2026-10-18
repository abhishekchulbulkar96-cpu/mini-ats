//candidate jpa repository
package com.abhi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.abhi.entity.Candidate;

@Repository
public interface CandidateRepository
        extends JpaRepository<Candidate, Long> {

}
