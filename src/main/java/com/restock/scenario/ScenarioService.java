package com.restock.scenario;

import com.restock.inventorypolicy.InventoryPolicyService;
import com.restock.inventorypolicy.dto.InventoryPolicyRequest;
import com.restock.inventorypolicy.dto.InventoryPolicyResponse;
import com.restock.scenario.dto.ScenarioCompareRequest;
import com.restock.scenario.dto.ScenarioCompareResponse;
import com.restock.scenario.dto.ScenarioDifference;
import org.springframework.stereotype.Service;

@Service
public class ScenarioService {
	
	private final InventoryPolicyService inventoryPolicyService;
	
	public ScenarioService(
			InventoryPolicyService inventoryPolicyService
	) {
		this.inventoryPolicyService = inventoryPolicyService;
	}
	
	public ScenarioCompareResponse compare(
			ScenarioCompareRequest request
	) {
		
		InventoryPolicyRequest baselineRequest =
				new InventoryPolicyRequest(
						request.itemId(),
						request.year(),
						request.baseline().orderingCost(),
						request.baseline().annualHoldingCostPerUnit()
				);
		
		InventoryPolicyRequest alternativeRequest =
				new InventoryPolicyRequest(
						request.itemId(),
						request.year(),
						request.alternative().orderingCost(),
						request.alternative().annualHoldingCostPerUnit()
				);
		
		InventoryPolicyResponse baseline =
				inventoryPolicyService.calculate(
						baselineRequest
				);
		
		InventoryPolicyResponse alternative =
				inventoryPolicyService.calculate(
						alternativeRequest
				);
		
		ScenarioDifference difference =
				new ScenarioDifference(
						
						alternative.economicOrderQuantity()
								.subtract(
										baseline.economicOrderQuantity()
								),
						
						alternative.safetyStock()
								.subtract(
										baseline.safetyStock()
								),
						
						alternative.reorderPoint()
								.subtract(
										baseline.reorderPoint()
								)
				);
		
		return new ScenarioCompareResponse(
				baseline,
				alternative,
				difference
		);
	}
}