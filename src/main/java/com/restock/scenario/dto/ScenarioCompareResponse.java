package com.restock.scenario.dto;

import com.restock.inventorypolicy.dto.InventoryPolicyResponse;

public record ScenarioCompareResponse(
		
		InventoryPolicyResponse baseline,
		InventoryPolicyResponse alternative,
		ScenarioDifference difference

) {
}