package com.restock.demand;

import com.restock.demand.dto.DemandHistoryRequest;
import com.restock.demand.dto.DemandHistoryResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demands")
public class DemandHistoryController {
	
	private final DemandHistoryService demandHistoryService;
	
	public DemandHistoryController(
			DemandHistoryService demandHistoryService
	) {
		this.demandHistoryService = demandHistoryService;
	}
	
	@PostMapping
	public ResponseEntity<DemandHistoryResponse> create(
			@Valid @RequestBody DemandHistoryRequest request
	) {
		DemandHistoryResponse response =
				demandHistoryService.create(request);
		
		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body(response);
	}
	
	@GetMapping("/{id}")
	public DemandHistoryResponse findById(
			@PathVariable Long id
	) {
		return demandHistoryService.findById(id);
	}
	
	@GetMapping("/item/{itemId}")
	public List<DemandHistoryResponse> findByItemId(
			@PathVariable Long itemId
	) {
		return demandHistoryService.findByItemId(itemId);
	}
	
	@PutMapping("/{id}")
	public DemandHistoryResponse update(
			@PathVariable Long id,
			@Valid @RequestBody DemandHistoryRequest request
	) {
		return demandHistoryService.update(id, request);
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable Long id
	) {
		demandHistoryService.delete(id);
		
		return ResponseEntity.noContent().build();
	}
}