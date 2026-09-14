package com.restock.item;

import com.restock.item.dto.ItemRequest;
import com.restock.item.dto.ItemResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {
	
	private final ItemService itemService;
	
	public ItemController(ItemService itemService) {
		this.itemService = itemService;
	}
	
	@PostMapping
	public ResponseEntity<ItemResponse> create(
			@Valid @RequestBody ItemRequest request
	) {
		ItemResponse response = itemService.create(request);
		
		return ResponseEntity
				.status(HttpStatus.CREATED)
				.body(response);
	}
	
	@GetMapping
	public List<ItemResponse> findAll() {
		return itemService.findAll();
	}
	
	@GetMapping("/{id}")
	public ItemResponse findById(
			@PathVariable Long id
	) {
		return itemService.findById(id);
	}
	
	@PutMapping("/{id}")
	public ItemResponse update(
			@PathVariable Long id,
			@Valid @RequestBody ItemRequest request
	) {
		return itemService.update(id, request);
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@PathVariable Long id
	) {
		itemService.delete(id);
		
		return ResponseEntity.noContent().build();
	}
}