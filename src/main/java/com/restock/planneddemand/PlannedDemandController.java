package com.restock.planneddemand;

import com.restock.planneddemand.dto.PlannedDemandRequest;
import com.restock.planneddemand.dto.PlannedDemandResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planned-demands")
public class PlannedDemandController {
	
	private final PlannedDemandService plannedDemandService;
	
	public PlannedDemandController(
			PlannedDemandService plannedDemandService
	) {
		this.plannedDemandService = plannedDemandService;
	}
	
	@PostMapping
	public ResponseEntity<PlannedDemandResponse> create(
			@Valid @RequestBody PlannedDemandRequest request
	) {
		
		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body(plannedDemandService.create(request));
	}
	
	@GetMapping
	public List<PlannedDemandResponse> findAll() {
		return plannedDemandService.findAll();
	}
	
	@GetMapping("/{id}")
	public PlannedDemandResponse findById(
			@PathVariable Long id
	) {
		return plannedDemandService.findById(id);
	}
	
	@GetMapping("/item/{itemId}")
	public List<PlannedDemandResponse> findByItemId(
			@PathVariable Long itemId
	) {
		return plannedDemandService.findByItemId(itemId);
	}
	
	@PutMapping("/{id}")
	public PlannedDemandResponse update(
			@PathVariable Long id,
			@Valid @RequestBody PlannedDemandRequest request
	) {
		return plannedDemandService.update(id, request);
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable Long id
	) {
		
		plannedDemandService.delete(id);
		
		return ResponseEntity.noContent().build();
	}
}