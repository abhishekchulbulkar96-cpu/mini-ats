//candidate interface

package com.abhi.service;
import java.util.List;

import com.abhi.entity.Candidate;

public interface CandidateService {

    Candidate createCandidate(Candidate candidate);

    List<Candidate> getAllCandidates();

    Candidate getCandidateById(Long id);

    Candidate updateCandidate(Long id, Candidate candidate);

    void deleteCandidate(Long id);
}
