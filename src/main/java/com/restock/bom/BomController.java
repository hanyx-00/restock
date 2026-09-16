package com.restock.bom;

import com.restock.bom.dto.BomQuantityUpdateRequest;
import com.restock.bom.dto.BomRequest;
import com.restock.bom.dto.BomResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boms")
public class BomController {
	
	private final BomService bomService;
	
	public BomController(BomService bomService) {
		this.bomService = bomService;
	}
	
	@PostMapping
	public ResponseEntity<BomResponse> create(
			@Valid @RequestBody BomRequest request
	) {
		
		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body(bomService.create(request));
	}
	
	@GetMapping("/parent/{parentItemId}")
	public List<BomResponse> findByParentItemId(
			@PathVariable Long parentItemId
	) {
		return bomService.findByParentItemId(parentItemId);
	}
	
	@PutMapping("/{id}")
	public BomResponse updateQuantity(
			@PathVariable Long id,
			@Valid
			@RequestBody
			BomQuantityUpdateRequest request
	) {
		
		return bomService.updateQuantity(
				id,
				request.quantityPer()
		);
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable Long id
	) {
		
		bomService.delete(id);
		
		return ResponseEntity.noContent().build();
	}
}