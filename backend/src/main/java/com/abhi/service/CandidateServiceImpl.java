//candidate service implemenation
package com.abhi.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.abhi.entity.Candidate;
import com.abhi.repository.CandidateRepository;
@Service
public class CandidateServiceImpl  implements CandidateService{

	private final CandidateRepository candidateRepository;
	
	public CandidateServiceImpl(CandidateRepository candidateRepository) {
		
		this.candidateRepository=candidateRepository;
	}
		
		
	
	
	   @Override
	    public Candidate createCandidate(Candidate candidate) {
	        return candidateRepository.save(candidate);
	    }

	    @Override
	    public List<Candidate> getAllCandidates() {
	        return candidateRepository.findAll();
	    }

	    @Override
	    public Candidate getCandidateById(Long id) {
	        return candidateRepository.findById(id)
	                .orElseThrow(() ->
	                        new RuntimeException("Candidate not found with id: " + id));
	    }

	    @Override
	    public Candidate updateCandidate(Long id, Candidate updatedCandidate) {
	        Candidate existingCandidate = getCandidateById(id);

	        existingCandidate.setFullName(updatedCandidate.getFullName());
	        existingCandidate.setEmail(updatedCandidate.getEmail());
	        existingCandidate.setPhone(updatedCandidate.getPhone());
	        existingCandidate.setPosition(updatedCandidate.getPosition());
	        existingCandidate.setSkills(updatedCandidate.getSkills());
	        existingCandidate.setStage(updatedCandidate.getStage());

	        return candidateRepository.save(existingCandidate);
	    }

	    @Override
	    public void deleteCandidate(Long id) {
	        Candidate candidate = getCandidateById(id);
	        candidateRepository.delete(candidate);

}
	    
}
