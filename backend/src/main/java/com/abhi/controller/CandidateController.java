//candidate controller
package com.abhi.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.abhi.entity.Candidate;
import com.abhi.service.CandidateService;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    // Create a candidate
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Candidate createCandidate(
            @Valid @RequestBody Candidate candidate) {
        return candidateService.createCandidate(candidate);
    }

    // Get all candidates
    @GetMapping
    public List<Candidate> getAllCandidates() {
        return candidateService.getAllCandidates();
    }

    // Get candidate by ID
    @GetMapping("/{id}")
    public Candidate getCandidateById(@PathVariable Long id) {
        return candidateService.getCandidateById(id);
    }

    // Update candidate
    @PutMapping("/{id}")
    public Candidate updateCandidate(
            @PathVariable Long id,
            @Valid @RequestBody Candidate candidate) {
        return candidateService.updateCandidate(id, candidate);
    }

    // Delete candidate
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCandidate(@PathVariable Long id) {
        candidateService.deleteCandidate(id);
    }
}
