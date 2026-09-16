package com.restock.inventorypolicy;

import com.restock.inventorypolicy.dto.InventoryPolicyRequest;
import com.restock.inventorypolicy.dto.InventoryPolicyResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory-policies")
public class InventoryPolicyController {
	
	private final InventoryPolicyService inventoryPolicyService;
	
	public InventoryPolicyController(
			InventoryPolicyService inventoryPolicyService
	) {
		this.inventoryPolicyService =
				inventoryPolicyService;
	}
	
	@PostMapping("/calculate")
	public InventoryPolicyResponse calculate(
			@Valid
			@RequestBody
			InventoryPolicyRequest request
	) {
		return inventoryPolicyService.calculate(request);
	}
}